# Contributing to Observer

First off, thank you for considering contributing to Observer! It's people like you that make Observer a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our standards of open and welcoming collaboration. Be respectful and constructive in your feedback.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue on GitHub. Include:
- A clear descriptive title.
- Steps to reproduce the bug.
- Expected behavior vs actual behavior.
- Any relevant logs or screenshots.

### Suggesting Enhancements

We welcome new features! If you want to suggest an enhancement:
- Create an issue outlining the feature and why it would be useful.
- Wait for feedback from maintainers before starting significant work.

### Adding New Parsers

If you want Observer to support a new website, you can contribute a new Parser:
1. Create a new file in `src/infrastructure/parsers/`.
2. Implement the `Parser` interface.
3. Write unit tests for your parser in the `tests/` directory.
4. Submit a Pull Request.

### Pull Requests

1. Fork the repository and create your branch from `main`.
2. Run `npm install` and ensure you can build the project.
3. Make your changes.
4. Test your changes locally via `npm run start`.
5. Ensure your code passes all linting and compilation checks.
6. Issue a Pull Request with a clear description of the changes.

## Setup for Development

Please refer to the **Installation** section in the `README.md` for instructions on setting up the project locally.
