@Library('jenkins-shared-library') _

def FAILED_STAGE = "Unknown"

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
        APP_NAME = 'JioBP'
        DEPLOYMENT_PORT = '4002'
    }

    stages {
        stage("Cleanup & Checkout") {
            steps {
                script {
                    FAILED_STAGE = "Cleanup & Checkout"
                }
                deleteDir()
                checkout scm
            }
        }

        stage('Sync Source to EC2') {
            steps {
                script {
                    FAILED_STAGE = "Sync Source to EC2"
                }
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
                script {
                    FAILED_STAGE = "Remote Build & Deploy"
                }
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

        stage('Health Check') {
            steps {
                script { FAILED_STAGE = "Health Check" }
                sh '''
                    # -v gives us the handshake details
                    # -L follows redirects
                    sleep 10
                    curl -v -f http://127.0.0.1:4002/ || exit 1
                '''
            }
        }
    }

    post {
        success {
            echo 'Deployment Successful!'
            sendBuildNotification("SUCCESS",FAILED_STAGE)
        }
        failure {
            echo 'Deployment Failed. Check PM2 logs on the server.'
            sendBuildNotification("FAILURE",FAILED_STAGE)
        }
        always {
            deleteDir()
        }
    }
}