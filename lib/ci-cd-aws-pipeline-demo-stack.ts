import * as cdk from "aws-cdk-lib";
import {
  CodePipeline,
  CodePipelineSource,
  ManualApprovalStep,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { MyPipelineAppStage } from "./stage";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CiCdAwsPipelineDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CiCdAwsPipelineDemoQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const pipeline = new CodePipeline(this, "Pipeline", {
      pipelineName: "TestPipeline",
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.gitHub(
          "darkelfs56/ci-cd-aws-pipeline-demo",
          "main",
          {
            authentication: cdk.SecretValue.secretsManager(
              "ci-cd-aws-pipeline-demo-github-token"
            ),
          }
        ),
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });

    const testingStage = pipeline.addStage(
      new MyPipelineAppStage(this, "test")
    );

    testingStage.addPost(
      new ManualApprovalStep("Manual approval before production")
    );

    const prodStage = pipeline.addStage(new MyPipelineAppStage(this, "prod"));
  }
}

//Need to create Github Access Token, as secret for AWS services
//1. Go to secrets-manager
//2. Store as other secret
//3. Store as plaintext; Just copy paste the whole access token string
