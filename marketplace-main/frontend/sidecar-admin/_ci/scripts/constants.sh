export DOCKER_REPO_URL="391503469783.dkr.ecr.us-west-2.amazonaws.com/sidecar-admin"
export REPO_HTTP="https://github.com/sidecar-financial/marketplace.git"
export INFRA_REPO="git@github.com:sidecar-financial/infrastructure-live.git"
# AWS Account ID of the account that owns the ECR repo.
export SHARED_SERVICES_ACCOUNT_ID="391503469783"
# The relative path from the git repository root in the application repo to the docker build context. The Docker build
# context is the working directory of the docker image build process.
export DOCKER_CONTEXT_PATH="frontend/sidecar-admin"
# The branch to use when committing to infrastructure-live.
export DEFAULT_INFRA_LIVE_BRANCH="main"
