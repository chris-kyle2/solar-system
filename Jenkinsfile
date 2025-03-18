pipeline{
    agent {
        node{
            label 'slavenode'
        }
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