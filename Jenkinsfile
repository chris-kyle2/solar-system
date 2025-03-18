pipeline {
    agent {
        node {
            label 'slavenode'
        }
    }
    tools {
        nodejs 'nodejs-22-6-0'
    }
    stages {
        stage('Print Node and Npm Version') {
            steps {
                sh '''
                    echo "Running sample script"
                    echo "Node Version: $(node --version)"
                    echo "Npm Version: $(npm --version)"
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install --no-audit'
            }
        }

        stage('Security Scans') {
            parallel {
                stage('NPM Dependency Audit') {
                    steps {
                        sh '''
                            echo "Running NPM Audit"
                            npm audit --audit-level=critical || echo "Audit failed but continuing..."
                            npm audit fix --force || echo "Fix failed but continuing..."
                        '''
                    }
                }

                stage('OWASP Dependency Check') {
                    steps {
                        sh '''
                            echo "Running OWASP Dependency Check"
                            mkdir -p reports
                            /opt/dependency-check/bin/dependency-check.sh --scan ./ \
                                --out reports \
                                --format ALL \
                                --prettyPrint
                        '''
                    }
                }
            }
        }
    }
}
