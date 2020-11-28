import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'authorization-service',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  // Add the serverless-webpack plugin
  plugins: [
    'serverless-webpack',
    'serverless-plugin-monorepo',
    'serverless-dotenv-plugin',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    region: 'eu-central-1',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
  },
  functions: {
    basicAuthorizer: {
      handler: 'handler.basicAuthorizer',
    },
  },
  resources: {
    Resources: {},
    Outputs: {
      BasicAuthArn: {
        Description: 'Arn for basic authorizer lambda function',
        Value: {
          'Fn::GetAtt': ['BasicAuthorizerLambdaFunction', 'Arn'],
        },
        Export: {
          Name: 'BasicAuthArn',
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
