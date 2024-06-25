FROM debian:11-slim
RUN mkdir -p "/usr/share/dotnet"
COPY --from=mcr.microsoft.com/dotnet/sdk:6.0 /usr/share/dotnet /usr/share/dotnet
ENV DOTNET_HOME=/usr/share/dotnet
ENV PATH=$DOTNET_HOME:$PATH
ENV SOLUTION_PATH=/usr/dt_maze_challenge/test
ENV LANGUAGE=typescript

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates unzip gnupg

RUN curl -fsSL https://deb.nodesource.com/setup_19.x | bash - 
RUN apt-get update
RUN apt-get install -y nodejs

RUN node --version && \
    npm --version

RUN npm install -g typescript@4.9.5

WORKDIR $SOLUTION_PATH

COPY ./src.zip $SOLUTION_PATH/src.zip
RUN unzip $SOLUTION_PATH/src.zip

COPY ./test.zip $SOLUTION_PATH/test.zip
RUN unzip $SOLUTION_PATH/test.zip

RUN echo "{\n \
    \"compilerOptions\": {\n \
        \"target\": \"es2017\",\n \
        \"module\": \"es2022\",\n \
        \"outDir\": \"./dist\",\n \
        \"moduleResolution\": \"node\",\n \
        \"esModuleInterop\": true,\n \
        \"sourceMap\": false,\n \
        \"noPropertyAccessFromIndexSignature\": false,\n \
        \"noUnusedParameters\": false,\n \
        \"forceConsistentCasingInFileNames\": true,\n \
        \"alwaysStrict\": true,\n \
        \"noImplicitOverride\": true,\n \
        \"noImplicitAny\": true,\n \
        \"noImplicitReturns\": true,\n \
        \"noImplicitThis\": true,\n \
        \"noUncheckedIndexedAccess\": true,\n \
        \"noFallthroughCasesInSwitch\": true,\n \
        \"allowUnreachableCode\": false,\n \
        \"declaration\": false,\n \
        \"allowSyntheticDefaultImports\": true,\n \
    },\n \
    \"include\": [\n \
        \"src/**/*\"\n \
    ]\n \
}" > $SOLUTION_PATH/tsconfig.json

RUN echo "{\n \
  \"name\": \"typescript-score-calculator\",\n \
  \"version\": \"1.0.0\",\n \
  \"type\": \"module\",\n \
  \"private\": true,\n \
  \"scripts\": {\n \
  },\n \
  \"dependencies\": {\n \
  },\n \
  \"devDependencies\": {\n \
    \"@types/node\": \"^18.17.0\",\n \
    \"typescript\": \"^4.9.5\"\n \
  }\n \
}" > $SOLUTION_PATH/package.json

RUN npm install
RUN tsc

WORKDIR $SOLUTION_PATH/test

ENTRYPOINT ["/usr/dt_maze_challenge/test/test/run_example_maze_solution.sh"]