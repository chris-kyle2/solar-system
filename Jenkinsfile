pipeline {
    agent {
        node {
            label 'Slave-Node'  
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
        DOCKER_IMAGE = 'solar-system-app'
        DOCKER_TAG = "${BUILD_NUMBER}"
        EC2_PUBLIC_IP = '34.201.29.244'
    }
    stages {
        stage('Cleanup Previous Containers') {
            steps {
                script {
                    sh '''
                        echo "Cleaning up previous containers..."
                        
                        # Stop and remove MongoDB container if exists
                        docker stop mongo-test || true
                        docker rm mongo-test || true
                        
                        # Stop and remove application container if exists
                        docker stop ${DOCKER_IMAGE} || true
                        docker rm ${DOCKER_IMAGE} || true
                        
                        # Remove network if exists
                        docker network rm solar-system-network || true
                        
                        echo "Cleanup completed"
                    '''
                }
            }
        }

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
                sh 'rm -rf node_modules package-lock.json'
                sh 'npm install'
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

        stage('Initialize MongoDB') {
            steps {
                script {
                    sh '''
                        echo "Updating MongoDB connection string in initDB.js"
                        sed -i "s|mongodb://localhost:27017/testdb|mongodb://$MONGO_USER:$MONGO_PASS@localhost:27017/testdb?authSource=admin|g" initDB.js
                        
                        echo "Running database initialization script"
                        node initDB.js
                    '''
                }
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
                    npm test
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh """
                        docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                        docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }

        stage('Deploy Application') {
            steps {
                script {
                    sh """
                        # Create network if it doesn't exist
                        docker network create solar-system-network || true

                        # Connect MongoDB container to the network
                        docker network connect solar-system-network mongo-test || true

                        # Run new container
                        docker run -d \
                            --name ${DOCKER_IMAGE} \
                            --network solar-system-network \
                            -p 3000:3000 \
                            -e MONGO_URI="mongodb://${MONGO_USER}:${MONGO_PASS}@mongo-test:27017/${MONGO_DB}?authSource=admin" \
                            -e MONGO_USERNAME="${MONGO_USER}" \
                            -e MONGO_PASSWORD="${MONGO_PASS}" \
                            ${DOCKER_IMAGE}:${DOCKER_TAG}
                    """
                }
            }
        }

        stage('Application Health Check') {
            steps {
                script {
                    sh '''
                        echo "Waiting for application to start..."
                        sleep 10

                        echo "Checking application health..."
                        curl -f http://localhost:3000/live || exit 1
                        curl -f http://localhost:3000/ready || exit 1
                        
                        echo "============================================="
                        echo "Application is running!"
                        echo "Access the application at: http://${EC2_PUBLIC_IP}:3000"
                        echo "============================================="
                        echo "To proceed with cleanup, manually approve the next stage"
                    '''
                }
            }
        }

        stage('Manual Verification') {
            steps {
                input message: """
                    Application is running!
                    
                    Access URL: http://${EC2_PUBLIC_IP}:3000
                    
                    Please verify the application and click 'Proceed' when ready to cleanup resources.
                    """
            }
        }
    }
    post {
        always {
            script {
                echo "Cleaning up resources..."
                sh '''
                    # Stop and remove containers
                    docker stop mongo-test || true
                    docker rm mongo-test || true
                    docker stop ${DOCKER_IMAGE} || true
                    docker rm ${DOCKER_IMAGE} || true
                    
                    # Remove images
                    docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true
                    docker rmi ${DOCKER_IMAGE}:latest || true
                    
                    # Remove network
                    docker network rm solar-system-network || true
                '''
            }
            archiveArtifacts artifacts: 'dependency-check-report/**', fingerprint: true
        }
        failure {
            echo "Pipeline failed. All resources have been cleaned up."
        }
        success {
            echo "Pipeline completed successfully!"
        }
    }
}
