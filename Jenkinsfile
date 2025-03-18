pipeline {
    agent {
        node {
            label 'slavenode'
        }
    }
    tools {
        nodejs 'nodejs-22-6-0'
        owaspDependencyCheck 'OWASP-10'
    }
    stages {
        stage('Print Node and Npm Version') {
            steps {
                sh '''
                    echo "running sample script"
                    echo "Node Version"
                    node --version
                    echo "Npm Version"
                    npm --version
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
                            npm audit --audit-level=critical
                            npm audit fix --force
                        '''
                    }
                }

stage('Owasp Dependency Check') {
            steps {
                sh '''
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
