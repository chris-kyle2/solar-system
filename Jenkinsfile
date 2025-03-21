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
        DOCKER_USERNAME = '22monk'
        DOCKER_PASSWORD = '91cqwerty12345@'
        EC2_PUBLIC_IP = '34.201.29.244'
    }
    stages {
        stage('Cleanup Previous Containers') {
            steps {
                script {
                    sh '''
                        echo "Cleaning up previous containers..."
                        docker stop mongo-test || true
                        docker rm mongo-test || true
                        docker stop ${DOCKER_IMAGE} || true
                        docker rm ${DOCKER_IMAGE} || true
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
                    sleep 5

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

        // stage('Unit Testing') {
        //     steps {
        //         sh '''
        //             echo "Running Unit Tests..."
        //             npm test
        //         '''
        //     }
        // }

        stage('Build Docker Image') {
            steps {
                script {
                    sh """
                        docker build -t ${DOCKER_IMAGE} .
                        docker tag ${DOCKER_IMAGE} ${DOCKER_USERNAME}/${DOCKER_IMAGE}:${GIT_COMMIT}
                    """
                }
            }
        }

        // stage('Trivy Security Scan') {
        //     steps {
        //         script {
        //             sh """
        //                 echo "Running Trivy Security Scan..."
        //                 docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
        //                     aquasec/trivy image --severity CRITICAL --quiet --format table ${DOCKER_USERNAME}/${DOCKER_IMAGE}:${GIT_COMMIT}
        //             """
        //         }
        //     }
        // }

        stage('Push Docker Image to Docker Hub') {
            steps {
                script {
                    sh """
                        docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}
                        docker push ${DOCKER_USERNAME}/${DOCKER_IMAGE}:${GIT_COMMIT}
                    """
                }
            }
        }

        stage('Deploy Application to EC2') {
            steps {
                script {
                    sshagent(['integration-testing-ec2-pvt-key']) {
                        sh """
                            echo "Deploying application to EC2..."
                            ssh -tt -o StrictHostKeyChecking=no jenkins@$54.90.82.189 << 'EOF'
                                echo "Starting MongoDB on EC2..."
                                docker run -d --name mongo-test -p 27017:27017 \\
                                    -e MONGO_INITDB_ROOT_USERNAME=${MONGO_USER} \\
                                    -e MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASS} \\
                                    -e MONGO_INITDB_DATABASE=${MONGO_DB} \\
                                    mongo:latest

                                sleep 5
                                echo "Checking MongoDB logs..."
                                docker logs mongo-test || echo "MongoDB log check failed but continuing..."

                                if docker ps -a | grep -q '${DOCKER_IMAGE}'; then
                                    echo "Stopping and removing existing container..."
                                    docker stop ${DOCKER_IMAGE} || true
                                    docker rm ${DOCKER_IMAGE} || true
                                    echo "Container stopped and removed"
                                fi

                                echo "Starting application on EC2..."
                                docker run -d --name ${DOCKER_IMAGE} \\
                                    -e MONGO_URI="mongodb://${MONGO_USER}:${MONGO_PASS}@mongo-test:27017/${MONGO_DB}?authSource=admin" \\
                                    -e MONGO_USERNAME="${MONGO_USER}" \\
                                    -e MONGO_PASSWORD="${MONGO_PASS}" \\
                                    -p 3000:3000 \\
                                    ${DOCKER_USERNAME}/${DOCKER_IMAGE}:${GIT_COMMIT}

                                echo "Application deployed to EC2"
                                echo "============================================="
                                echo "Access the application at: http://${EC2_PUBLIC_IP}:3000"
                                echo "============================================="
                            EOF
                        """
                    }
                }
            }
        }
    }
    post {
        always {
            script {
                echo "Cleaning up resources..."
                sh '''
                    docker stop mongo-test || true
                    docker rm mongo-test || true
                    docker stop ${DOCKER_IMAGE} || true
                    docker rm ${DOCKER_IMAGE} || true
                    docker rmi ${DOCKER_USERNAME}/${DOCKER_IMAGE}:${GIT_COMMIT} || true
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
