module.exports = {
    apps: [{
        name: 'jiobp-4002',
        script: "node_modules/next/dist/bin/next",
        args: "start -p 4002",
        cwd: '/home/ubuntu/apps/JioBP',
        exec_mode: 'fork',
        instances: 1,
        env: {
            NODE_ENV: 'production'
        },
    }]
}