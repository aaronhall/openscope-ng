# Contribution Guidelines
Hello, and thank you for your interest in contributing to openScope NG! Please take a minute to review these Contribution Guidelines, as this will result in getting your issue resolved or pull request merged faster.

## Getting set up
Here at openScope NG, we use multiple tools for development, the basics being Git and Node (see the quick start guide in our [README](README.md) file for help). Please use eslint to ensure your code conforms to our conventions. For help, [open a GitHub issue](https://github.com/aaronhall/openscope-ng/issues).

## Getting Push Access
Please use the [openScope NG repository](https://github.com/aaronhall/openscope-ng) for branches and pull requests. Do not target the upstream repository.

## Creating a pull request
Every pull request on openScope NG has a corresponding issue that describes the work to be done, and a category that it falls into. If no issue exists for the planned changes, create a new one. Remember to keep each issue and pull request focused and specific, and _keep the PR changes focused on the changes planned by the issue._ Generally, the smaller they are, the sooner they're merged.

__Branch names should take the format of `category/issuenumber`__ (see our [git flow document](documentation/git-flow-process.md) for more information).

So we can see what other team members are working on, we push branches to the main repo and open "work-in-progress" pull requests right away. Open up a pull request (using base of `develop`) on the GitHub website with a label of `WIP` (work-in-progress) and go about making your changes.

## Review Process
Once you're finished and your PR is ready, remove the `WIP` label and request a review from...

- Airport/Aircraft file changes - `airport-reviewers` team (or specific people as needed)
- Code related and all other changes - `code-reviewers` team (or specific people as needed)

Once they approve your pull request, a repository maintainer will merge it into the appropriate branch. We test changes before they are released and keep the deployed site current.

## Commit Messages
For all commit messages, please:

- prefix with the branch name
- use the present tense
- keep it brief, but descriptive

Example: `documentation/723 - Add contribution guidelines file`

## Additional Information
More information on our processes and file formats can be found in the [documentation folder](documentation/). If you have any questions, [open a GitHub issue](https://github.com/aaronhall/openscope-ng/issues).

We really appreciate your willingness to put your time into improving openScope NG! It is thanks to our dedicated contributors that the simulator continues to grow.

- *The openScope NG team*
