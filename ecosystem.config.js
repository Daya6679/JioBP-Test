module.exports = {
    apps: [{
        name: "jiobp-staging",
        script: "server.js",
        cwd: "/home/ubuntu/app/jiobp",
        exec_mode: "fork",
        instances: 1,
        env: {
            NODE_ENV: "production",
            PORT: 3000
        }
    }]
};