module.exports = {
    apps: [{
        name: 'jiobp-4002',
        script: "server.js",
        cwd: '/home/ubuntu/apps/JioBP',
        exec_mode: 'fork',
        instances: 1,
        env: {
            NODE_ENV: 'production',
            PORT: 4002
        },
    }]
}