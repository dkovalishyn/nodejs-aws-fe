import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service',
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
    'serverless-event-body-option',
  ],
  provider: {
    name: 'aws',
    region: 'eu-central-1',
    runtime: 'nodejs12.x',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      SQS_URL: {
        Ref: 'SqsQueue',
      },
      SNS_ARN: {
        Ref: 'SnsTopic',
      },
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['sqs:*'],
        Resource: [{ 'Fn::GetAtt': ['SqsQueue', 'Arn'] }],
      },
      {
        Effect: 'Allow',
        Action: ['sns:*'],
        Resource: [{ Ref: 'SnsTopic' }],
      },
    ],
  },
  functions: {
    getProductsList: {
      handler: 'handlers.getProductsList',
      events: [
        {
          http: {
            cors: true,
            method: 'get',
            path: '/products',
          },
        },
      ],
    },
    getProductById: {
      handler: 'handlers.getProductById',
      events: [
        {
          http: {
            cors: true,
            method: 'get',
            path: '/products/{id}',
            request: {
              parameters: {
                paths: {
                  id: true,
                },
              },
            },
          },
        },
      ],
    },
    addProduct: {
      handler: 'handlers.addProduct',
      events: [
        {
          http: {
            cors: true,
            method: 'post',
            path: '/products',
          },
        },
      ],
    },
    catalogBatchProcess: {
      handler: 'handlers.catalogBatchProcess',
      events: [
        {
          sqs: {
            batchSize: 5,
            arn: {
              'Fn::GetAtt': ['SqsQueue', 'Arn'],
            },
          },
        },
      ],
    },
  },
  resources: {
    Resources: {
      SqsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalogItemsQueue',
        },
      },
      SnsTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'createProductTopic',
        },
      },
      SnsSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'denys.kovalishyn@gmail.com',
          Protocol: 'email',
          TopicArn: {
            Ref: 'SnsTopic',
          },
        },
      },
      SnsHighPriceSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'dkovalishyn@gmail.com',
          Protocol: 'email',
          TopicArn: {
            Ref: 'SnsTopic',
          },
          FilterPolicy: {
            price: [{ numeric: ['>', 1000] }],
          },
        },
      },
    },
    Outputs: {
      SqsQueueUrl: {
        Value: {
          Ref: 'SqsQueue',
        },
      },
      SqsQueueArn: {
        Value: {
          'Fn::GetAtt': ['SqsQueue', 'Arn'],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
