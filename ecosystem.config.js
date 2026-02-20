module.exports = {
    apps: [
        {
            name: 'spicc-next-app',
            script: 'npm',
            args: 'run start',
            env: {
                NODE_ENV: 'production',
                PORT: 3100
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            log_date_format: 'YYYY-MM-DD HH:mm Z',
            error_file: './logs/error.log',
            out_file: './logs/out.log',
            merge_logs: true
        }
    ]
};
