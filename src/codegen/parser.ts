import * as ts from "typescript";
import { readFileSync } from "fs";
import { Class, Property, Context } from "./types";

let currentClass: Class;
let currentProperty: Property;

function defineProperty(property: Property, initializer: any) {
    if (ts.isIdentifier(initializer)) {
        property.type = "ref";
        property.childType = initializer.text;

    } else if (initializer.kind == ts.SyntaxKind.ObjectLiteralExpression) {
        property.type = "map";
        property.childType = initializer.properties[0].initializer.text;

    } else if (initializer.kind == ts.SyntaxKind.ArrayLiteralExpression) {
        property.type = "array";
        property.childType = initializer.elements[0].text;

    } else {
        property.type = initializer.text;
    }
}

function inspectNode(node: ts.Node, context: Context, decoratorName: string) {
    switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
            currentClass = new Class();

            const heritageClauses = (node as ts.ClassLikeDeclarationBase).heritageClauses;
            if (heritageClauses && heritageClauses.length > 0) {
                currentClass.extends = heritageClauses[0].types[0].getText();
            }

            context.addClass(currentClass);
            break;

        // case ts.SyntaxKind.PropertyDeclaration:
        //     break;

        case ts.SyntaxKind.ExtendsKeyword:
            console.log(node.getText());
            break;

        case ts.SyntaxKind.Identifier:
            if (
                node.getText() === "deprecated" &&
                node.parent.kind !== ts.SyntaxKind.ImportSpecifier
            ) {
                currentProperty = new Property();
                currentProperty.deprecated = true;
                break;
            }

            if (
                node.getText() === decoratorName &&
                node.parent.kind !== ts.SyntaxKind.ImportSpecifier &&
                node.parent.kind !== ts.SyntaxKind.BindingElement
            ) {
                const prop: any = node.parent.parent.parent;
                const propDecorator = node.parent.parent.parent.decorators;

                // using as decorator
                if (propDecorator) {
                    /**
                     * Calling `@type()` as decorator
                     */
                    const typeDecorator: any = propDecorator.find((decorator => {
                        return (decorator.expression as any).expression.escapedText === decoratorName;
                    })).expression;

                    const property = currentProperty || new Property();
                    property.name = prop.name.escapedText;
                    currentClass.addProperty(property);

                    const typeArgument = typeDecorator.arguments[0];
                    defineProperty(property, typeArgument);

                } else {
                    /**
                     * Calling `type()` as a regular method
                     */
                    const property = currentProperty || new Property();
                    property.name = prop.expression.arguments[1].text;
                    currentClass.addProperty(property);

                    const typeArgument = prop.expression.expression.arguments[0];
                    defineProperty(property, typeArgument);
                }


            } else if (
                node.getText() === "defineTypes" &&
                node.parent.kind === ts.SyntaxKind.CallExpression
            ) {
                /**
                 * JavaScript source file (`.js`)
                 * Using `defineTypes()`
                 */
                const callExpression = node.parent as ts.CallExpression;

                const className = callExpression.arguments[0].getText()
                currentClass.name = className;

                const types = callExpression.arguments[1] as any;
                for (let i=0; i<types.properties.length; i++) {
                    const prop = types.properties[i];

                    const property = currentProperty || new Property();
                    property.name = prop.name.escapedText;
                    currentClass.addProperty(property);

                    defineProperty(property, prop.initializer);
                }

            }

            if (node.parent.kind === ts.SyntaxKind.ClassDeclaration) {
                currentClass.name = node.getText();
            }

            currentProperty = undefined;

            break;
    }

    ts.forEachChild(node, (n) => inspectNode(n, context, decoratorName));
}

export function parseFiles(fileNames: string[], decoratorName: string = "type"): Class[] {
    const context = new Context();

    fileNames.forEach((fileName) => {
        let sourceFile = ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.ES2018, true);
        inspectNode(sourceFile, context, decoratorName);
    });

    return context.getSchemaClasses();
}