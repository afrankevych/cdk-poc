⚠️ Disclaimer: This service is a work in progress used to learn and explore AWS CDK features and is not intended to be used in
production (a.k.a. the code is shit, I'm just messing around)

# CDK Media Extraction POC

[![test](https://github.com/afrankevych/cdk-poc/actions/workflows/test.yml/badge.svg)](https://github.com/afrankevych/cdk-poc/actions/workflows/test.yml)

Pokémon™️ and Digimon™️ media assets extraction service

## Architecture

The service is subscribed to a media extraction event.

When the event is received the service extracts an image from [Pokémon](https://pokeapi.co/) and
[Digimon](https://digimon-api.vercel.app/) public API services and uploads it to an S3 bucket.

```mermaid
flowchart TD
eb(eventbus)
subgraph step function
	sf1{choice state}
	sf2p(pokemon img extractor)
	sf2d(digimon img extractor)
	sf3(extraction completed task)
end
s3[(creature img bucket)]

eb -- sub event --> sf1
sf1 -- pokemon --> sf2p
sf1 -- digimon --> sf2d
sf1 -- unknown input --> sf3
sf2p -. uploads img .-> s3
sf2d -. uploads img .-> s3
sf2p --> sf3
sf2d --> sf3
sf3 -- pub event --> eb
```

## Development

The `cdk.json` file tells the CDK Toolkit how to execute your app.

### Useful commands

* `npm run tc`              perform ts type-check
* `npm run build`           compile typescript to js in dist folder
* `npm run test`            perform the jest unit tests
* `npm run cdk deploy`      deploy this stack to your default AWS account/region
* `npm run cdk diff`        compare deployed stack with current state
* `npm run cdk synth`       emits the synthesized CloudFormation template

## TODO:

- [x] Add S3 storage to infra
- [x] Add Pokemon media extractor
    - [x] Add Pokemon API integration
    - [x] Add S3 integration
- [ ] Add Digimon media extractor
  - [ ] Add Digimon API integration
  - [ ] Add S3 integration
- [x] Add lambda handler for pokemon media extraction
- [ ] Add lambda handler for pokemon media extraction
- [ ] Add step function
  - [ ] Lambda choice step
  - [ ] Media extraction completed task
- [ ] Add EventBridge Integration 
- [ ] Add datadog integration (lambda construct extension or using _CDK Aspects_)