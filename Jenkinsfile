pipeline {
    agent any

    tools {
        nodejs "nodejs-23"
    }

    environment {
        DEPLOY_PATH = '/home/ubuntu/apps/JioBP'
        ENV_SECRET_ID = 'JioBP'
        PM2_PATH = '/home/ubuntu/.nvm/versions/node/v23.11.1/bin/pm2'
        NPM_BIN = '/home/ubuntu/.nvm/versions/node/v23.11.1/bin/npm'
    }

    stages {
        stage("Cleanup & Checkout") {
            steps {
                deleteDir()
                checkout scm
            }
        }

        stage('Sync Source to EC2') {
            steps {
                echo 'Syncing source code to production path...'
                sh """
                    set -e
                    sudo -u ubuntu rsync -rlvz --delete \
                    --exclude 'node_modules' \
                    --exclude '.next' \
                    --exclude '.git' \
                    . ${DEPLOY_PATH}
                """
            }
        }

        stage('Remote Build & Deploy') {
            steps {
                withCredentials([file(credentialsId: "${ENV_SECRET_ID}", variable: 'SECRET_ENV_FILE')]) {
                    sh '''
                        set -e
                        
                        # 1. JENKINS user copies the file (Jenkins owns the secret)
                        cp "${SECRET_ENV_FILE}" "${DEPLOY_PATH}/.env.production"
                        
                        # 2. Fix ownership so ubuntu can use it for the build
                        sudo chown ubuntu:ubuntu "${DEPLOY_PATH}/.env.production"

                        cd ${DEPLOY_PATH}

                        # 3. Proceed with ubuntu user tasks
                        sudo -u ubuntu ${NPM_BIN} install
                        sudo -u ubuntu ${NPM_BIN} run build

                        echo "Restarting PM2..."
                        sudo -u ubuntu ${PM2_PATH} restart jiobp-4002 --update-env || \
                        sudo -u ubuntu ${PM2_PATH} start ecosystem.config.js --update-env
                        sudo -u ubuntu ${PM2_PATH} save
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment Successful!'
        }
        failure {
            echo 'Deployment Failed. Check PM2 logs on the server.'
        }
        always {
            deleteDir()
        }
    }
}