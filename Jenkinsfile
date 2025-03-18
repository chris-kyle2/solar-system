pipeline{
    agent {
        node{
            label 'slavenode'
        }
    }
    tools{
        nodejs 'nodejs-22-6-0'
    }
    stages{
        stage('Print Node and Npm Version'){
            steps{
                sh '''
                    echo "running sample script"
                    echo "Node Version"
                    node --version
                    echo "Npm Version"
                    npm --version
                '''
            }
            
        }
        stage("install dependencies"){
                steps{
                sh 'npm install --no-audit'
            }
        }
        parallel{
        stage('NPM Dependency Audit'){
            steps{
                sh '''
                npm audit --audit-level=critical
                echo $?
                '''
            }
        }
        stage('Owasp Dependency Check'){
            steps{
                dependencyCheck additionalArguments: '''--scan ./ \\
                    --out reports \\
                    --format ALL \\
                    --prettyPrint''', nvdCredentialsId: 'NVD-API-KEY', odcInstallation: 'OWASP-10'
            }
        }
        }
    }
}
