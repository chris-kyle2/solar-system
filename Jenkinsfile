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
        K8S_MANIFEST = 'kubernetes/development/node-app-deployment.yaml'
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
        //                     aquasec/trivy image --severity CRITICAL --format table ${DOCKER_USERNAME}/${DOCKER_IMAGE}:${GIT_COMMIT}
                            
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

        stage('Deploy Application') {
            steps {
                script {
                    sh """
                        docker network create solar-system-network || true
                        docker network connect solar-system-network mongo-test || true

                        docker run -d \
                            --name ${DOCKER_IMAGE} \
                            --network solar-system-network \
                            -p 3000:3000 \
                            -e MONGO_URI="mongodb://${MONGO_USER}:${MONGO_PASS}@mongo-test:27017/${MONGO_DB}?authSource=admin" \
                            -e MONGO_USERNAME="${MONGO_USER}" \
                            -e MONGO_PASSWORD="${MONGO_PASS}" \
                            ${DOCKER_USERNAME}/${DOCKER_IMAGE}:${GIT_COMMIT}
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
        stage('Update Kubernetes Manifest') {
            steps {
                script {
                    sh """
                        sed -i 's|image: ${DOCKER_USERNAME}/${DOCKER_IMAGE}:.*|image: ${DOCKER_USERNAME}/${DOCKER_IMAGE}:${GIT_COMMIT}|' ${K8S_MANIFEST}
                        git config --global user.email "jenkins@example.com"
                        git config --global user.name "Jenkins CI"
                        git add ${K8S_MANIFEST}
                        git commit -m "Update Kubernetes deployment to image ${GIT_COMMIT}"
                        git push origin main
                    """
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
