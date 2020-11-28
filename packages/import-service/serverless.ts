import type { Serverless } from 'serverless/aws';
import { BUCKET } from './bucket';

const authResponseParameters = {
  'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
  'gatewayresponse.header.Access-Control-Allow-Credentials': "'true'",
};

const serverlessConfiguration: Serverless = {
  service: {
    name: 'import-service',
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
    'serverless-pseudo-parameters',
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
      SQS_QUEUE_URL: '${cf:product-service-${self:provider.stage}.SqsQueueUrl}',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['s3:ListBucket'],
        Resource: [`arn:aws:s3:::${BUCKET}`],
      },
      {
        Effect: 'Allow',
        Action: ['s3:*'],
        Resource: [`arn:aws:s3:::${BUCKET}/*`],
      },
      {
        Effect: 'Allow',
        Action: ['sqs:*'],
        Resource: ['${cf:product-service-${self:provider.stage}.SqsQueueArn}'],
      },
    ],
  },
  functions: {
    importProductsFile: {
      handler: 'handler.importProductsFile',
      events: [
        {
          http: {
            cors: true,
            method: 'get',
            path: 'import',
            authorizer: {
              name: 'basicAuthorizer',
              type: 'token',
              identitySource: 'method.request.header.Authorization',
              resultTtlInSeconds: 0,
              arn: {
                'Fn::ImportValue': 'BasicAuthArn',
              } as any,
            },
            request: {
              parameters: {
                querystrings: {
                  name: true,
                },
              },
            },
          },
        },
      ],
    },
    importFileParser: {
      handler: 'handler.importFileParser',
      events: [
        {
          s3: {
            bucket: BUCKET,
            event: 's3:ObjectCreated:*',
            rules: [
              {
                prefix: 'uploaded/',
                suffix: '.csv',
              },
            ],
            existing: true,
          },
        },
      ],
    },
  },
  resources: {
    Resources: {
      GatewayResponseDenied: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: authResponseParameters,
          ResponseType: 'ACCESS_DENIED',
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
        },
      },
      GatewayResponseUnauthorized: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: authResponseParameters,
          ResponseType: 'UNAUTHORIZED',
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
