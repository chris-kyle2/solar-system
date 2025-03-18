pipeline{
    agent {
        node{
            label 'slavenode'
        }
    }
    tools{
        nodeJS 'nodejs-22-6-0'
    }
    stages{
        stage('Print Node and Npm Version'){
            steps{
                sh '''
                    echo "Node Version"
                    node --version
                    echo "Npm Version"
                    npm --version
                '''
            }
        }
    }
}