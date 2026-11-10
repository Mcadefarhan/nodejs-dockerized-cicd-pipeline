pipeline {
  agent any

  tools { nodejs 'node18' }          // Manage Jenkins > Tools me NodeJS 'node18' add karo

  triggers { githubPush() }          // GitHub webhook se auto-trigger

  environment {
    IMAGE    = 'YOUR_DOCKERHUB_USER/strut-store'
    TAG      = "${env.BUILD_NUMBER}"
    EC2_HOST = 'YOUR_EC2_PUBLIC_IP'
    EC2_USER = 'ec2-user'
    MAIL_TO  = 'you@example.com'
  }

  stages {
    stage('Install') {
      steps { sh 'npm ci' }
    }

    stage('Test') {
      steps { sh 'npm test' }
    }

    stage('Docker Build') {
      steps { sh 'docker build -t $IMAGE:$TAG -t $IMAGE:latest .' }
    }

    stage('Docker Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                                          usernameVariable: 'DH_USER',
                                          passwordVariable: 'DH_PASS')]) {
          sh 'echo $DH_PASS | docker login -u $DH_USER --password-stdin'
          sh 'docker push $IMAGE:$TAG && docker push $IMAGE:latest'
        }
      }
    }

    stage('Deploy to EC2') {
      steps {
        sshagent(credentials: ['ec2-ssh']) {
          sh '''
            ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST "
              docker pull $IMAGE:$TAG &&
              (docker rm -f strut || true) &&
              docker run -d --name strut --restart unless-stopped -p 80:3000 $IMAGE:$TAG
            "
          '''
        }
      }
    }
  }

  post {
    success {
      mail to: "${MAIL_TO}", subject: "STRUT build #${BUILD_NUMBER} deployed",
           body: "Live ho gaya: http://${EC2_HOST}\n${BUILD_URL}"
    }
    failure {
      mail to: "${MAIL_TO}", subject: "STRUT build #${BUILD_NUMBER} FAILED",
           body: "Logs dekho: ${BUILD_URL}console"
    }
  }
}
