
function convertTreeToNewick(tree) {

    // STEP 1: Validate the root input.
    if (
        !tree ||
        typeof tree !== "object" ||
        Array.isArray(tree)
    ) {
        throw new Error("A valid phylogenetic tree is required.");
    }


    // STEP 2: Track nodes to detect cycles or reused nodes.
    const visitedNodes = new WeakSet();


    // STEP 3: Convert a taxon name into a valid Newick label.
    function serializeLabel(name) {

        if (
            typeof name !== "string" ||
            name.trim().length === 0
        ) {
            throw new Error(
                "Taxon names must be non-empty strings."
            );
        }

        // Newick labels containing whitespace or special
        // characters must be enclosed in single quotes.
        const requiresQuotes = /[\s()[\],:;'"]/u.test(name);

        if (!requiresQuotes) {
            return name;
        }

        // Newick escapes an apostrophe by doubling it.
        const escapedName = name.replace(/'/g, "''");

        return `'${escapedName}'`;
    }


    // STEP 4: Validate and serialize each tree node.
    function serializeNode(node) {

        if (
            !node ||
            typeof node !== "object" ||
            Array.isArray(node)
        ) {
            throw new Error("Invalid phylogenetic tree node.");
        }

        // Detect circular references and reused node objects.
        if (visitedNodes.has(node)) {
            throw new Error(
                "A phylogenetic tree cannot contain cycles or reused nodes."
            );
        }

        visitedNodes.add(node);


        // STEP 5: Serialize a leaf node.
        if (typeof node.name === "string") {

            return serializeLabel(node.name);

        }


        // STEP 6: Validate an internal node.
        if (node.name !== null) {
            throw new Error(
                "Tree nodes must have a taxon name or a null internal-node name."
            );
        }

        if (
            !node.left ||
            typeof node.left !== "object" ||
            Array.isArray(node.left) ||
            !node.right ||
            typeof node.right !== "object" ||
            Array.isArray(node.right)
        ) {
            throw new Error(
                "Internal nodes must contain valid left and right branches."
            );
        }


        // STEP 7: Validate branch lengths.
        const leftLength = node.left.branchLength;
        const rightLength = node.right.branchLength;

        for (const branchLength of [leftLength, rightLength]) {

            if (
                typeof branchLength !== "number" ||
                !Number.isFinite(branchLength) ||
                branchLength < 0
            ) {
                throw new Error(
                    "Branch lengths must be finite non-negative numbers."
                );
            }

        }


        // STEP 8: Recursively serialize child nodes.
        const left = serializeNode(node.left.node);
        const right = serializeNode(node.right.node);


        // STEP 9: Combine both branches.
        return `(${left}:${leftLength},${right}:${rightLength})`;

    }


    // STEP 10: Serialize the complete tree.
    return serializeNode(tree) + ";";

}


// STEP 11: Export the serializer.
module.exports = {
    convertTreeToNewick
};