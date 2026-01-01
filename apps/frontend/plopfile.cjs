// plopfile.cjs
module.exports = function (plop) {
    // Custom helper: trim whitespace
    plop.setHelper("trim", (text) => text.trim());

    // Optional: ensure no leading/trailing slash
    plop.setHelper("cleanPath", (text) =>
        text.trim().replace(/^\/+|\/+$/g, "")
    );

    plop.setGenerator("component", {
        description: "Generate a React component boilerplate",
        prompts: [
            {
                type: "input",
                name: "name",
                message: "Component name (e.g., Button)?",
                validate: (input) => (input ? true : "Name is required"),
            },
            {
                type: "input",
                name: "location",
                message: "Location (relative to src/, e.g., components/ui)?",
                default: "components",
            },
        ],
        actions: [
            {
                type: "add",
                path: "src/{{cleanPath location}}/{{pascalCase name}}/{{pascalCase name}}.tsx",
                templateFile: "plop-templates/component.hbs",
            },
            {
                type: "add",
                path: "src/{{cleanPath location}}/{{pascalCase name}}/index.ts",
                template:
                    'export { {{pascalCase name}} } from "./{{pascalCase name}}";',
            },
            {
                type: "add",
                path: "src/{{cleanPath location}}/{{pascalCase name}}/{{pascalCase name}}.types.ts",
                templateFile: "plop-templates/component.types.hbs",
            },
        ],
    });
};
