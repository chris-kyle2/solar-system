pipeline{
    agent {
        node{
            label 'slavenode'
        }
    }
    tools{
        NodeJS 'nodejs-22-6-0'
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
    }
}