pipeline {
    agent {
        node {
            label 'Slave-Node'
        }
    }
    tools {
        nodejs 'Node-js-22-60'
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
                        echo "Running OWASP Dependency Check"
                        sh 'mkdir -p dependency-check-report'

                        // Ensure script has correct permissions before execution
                        sh 'chmod +x /var/lib/jenkins/tools/bin/dependency-check.sh'

                        sh '''
                            /var/lib/jenkins/tools/bin/dependency-check.sh \
                            --scan ./ \
                            --out dependency-check-report \
                            --format ALL \
                            --prettyPrint \
                            --noupdate || echo "Dependency check failed but continuing..."
                        '''
                    }
                }
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'dependency-check-report/**', fingerprint: true
        }
    }
}
