pipeline {
  agent any

  tools { nodejs 'node18' }
  triggers { pollSCM('H/5 * * * *') }

  environment {
    IMAGE = 'strut-store'
    TAG   = "${env.BUILD_NUMBER}"
  }

  stages {
    stage('Install') {
      steps { sh 'npm ci' }
    }

    stage('Test') {
      steps { sh 'npm test' }
    }

    stage('Docker Build') {
      steps { sh 'docker build -t $IMAGE:$TAG .' }
    }

    stage('Deploy') {
      steps {
        sh '''
          docker rm -f strut || true
          docker run -d --name strut --restart unless-stopped -p 3001:3000 $IMAGE:$TAG
        '''
      }
    }
  }
}
