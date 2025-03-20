pipeline {
    agent {
        node {
            label 'Slave-Node'  // Replace with your actual slave label
        }
    }
    tools {
        nodejs 'Node-js-22-60'
    }
    options {
        timestamps()
    }
    environment {
        MONGO_USER = 'testuser'
        MONGO_PASS = 'testpassword'
        MONGO_DB = 'testdb'
        MONGO_URI = "mongodb://testuser:testpassword@localhost:27017/testdb?authSource=admin"
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

        stage('Start MongoDB in Docker') {
            steps {
                sh '''
                    echo "Starting MongoDB Container with Authentication"
                    docker run -d --name mongo-test -p 27017:27017 \
                        -e MONGO_INITDB_ROOT_USERNAME=$MONGO_USER \
                        -e MONGO_INITDB_ROOT_PASSWORD=$MONGO_PASS \
                        -e MONGO_INITDB_DATABASE=$MONGO_DB \
                        mongo:latest
                    
                    echo "Waiting for MongoDB to be ready..."
                    sleep 5  # Ensure MongoDB is up

                    echo "Checking MongoDB logs for errors..."
                    docker logs mongo-test || echo "MongoDB log check failed but continuing..."
                '''
            }
        }

        // stage('Security Scans') {
        //     parallel {
        //         stage('NPM Dependency Audit') {
        //             steps {
        //                 sh '''
        //                     echo "Running NPM Audit"
        //                     npm audit --audit-level=critical || echo "Audit failed but continuing..."
        //                     npm audit fix --force || echo "Fix failed but continuing..."
        //                 '''
        //             }
        //         }

        //         stage('OWASP Dependency Check') {
        //             steps {
        //                 echo "Running OWASP Dependency Check"
        //                 sh 'mkdir -p dependency-check-report'

        //                 // Ensure script has correct permissions before execution
        //                 sh 'chmod +x /var/lib/jenkins/tools/bin/dependency-check.sh'

        //                 sh '''
        //                     /var/lib/jenkins/tools/bin/dependency-check.sh \
        //                     --scan ./ \
        //                     --out dependency-check-report \
        //                     --format ALL \
        //                     --prettyPrint \
        //                     --noupdate || echo "Dependency check failed but continuing..."
        //                 '''
        //             }
        //         }
        //     }
        // }

        stage('Unit Testing') {
            steps {
                sh '''
                    echo "Running Unit Tests..."
                    npm test || (echo "Tests failed!" && exit 1)
                '''
            }
        }

        stage('Cleanup MongoDB') {
            steps {
                sh '''
                    echo "Stopping and Removing MongoDB Container"
                    docker stop mongo-test
                    docker rm mongo-test
                '''
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'dependency-check-report/**', fingerprint: true
        }
        failure {
            echo "Pipeline failed. Check logs for details."
        }
    }
}
