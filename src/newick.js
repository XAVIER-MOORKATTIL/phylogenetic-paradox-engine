
function convertTreeToNewick(tree) {
    if (!tree || typeof tree !== "object") {
        throw new Error("A valid phylogenetic tree is required.");
    }

    function serializeNode(node) {
        if (node.name !== null) {
            return node.name;
        }

        const left = serializeNode(node.left.node);
        const right = serializeNode(node.right.node);

        return `(${left}:${node.left.branchLength},${right}:${node.right.branchLength})`;
    }

    return serializeNode(tree) + ";";
}

module.exports = {
    convertTreeToNewick
};
