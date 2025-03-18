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

                stage('OWASP Dependency Check') {
                    steps {
                        sh '''
                            dependencyCheck additionalArguments: '''
                            --scan ./ \\
                            --out reports \\
                            --format ALL \\
                            --prettyPrint''', nvdCredentialsId: 'NVD-API-KEY', odcInstallation: 'OWASP-10'
                        '''
                    }
                }
            }
        }
    }
}
