
function buildUpgmaTree(distanceMatrix) {
    

        // STEP 1: Validate the overall input.
    if (
        typeof distanceMatrix !== "object" ||
        distanceMatrix === null ||
        Array.isArray(distanceMatrix)
    ) {
        throw new Error("Input must be a valid distance matrix object.");
    }

    const names = Object.keys(distanceMatrix);

    if (names.length < 2) {
        throw new Error("At least two organisms are required.");
    }

    // STEP 2: Validate every organism row.
    for (const nameA of names) {

        const row = distanceMatrix[nameA];

        if (
            typeof row !== "object" ||
            row === null ||
            Array.isArray(row)
        ) {
            throw new Error("Invalid distance matrix.");
        }
    }

    // STEP 3: Validate every distance value.
    for (const nameA of names) {

        for (const nameB of names) {

            const row = distanceMatrix[nameA];

            if (!Object.prototype.hasOwnProperty.call(row, nameB)) {
                throw new Error("Distance matrix is incomplete.");
            }

            const distance = row[nameB];

            if (
                typeof distance !== "number" ||
                !Number.isFinite(distance) ||
                distance < 0
            ) {
                throw new Error(
                    "Distances must be finite non-negative numbers."
                );
            }

            // Every organism must have zero distance from itself.
            if (
                nameA === nameB &&
                Math.abs(distance) > 1e-10
            ) {
                throw new Error("Diagonal distances must be zero.");
            }
        }
    }

    // STEP 4: Validate symmetry.
    for (let i = 0; i < names.length; i++) {

        for (let j = i + 1; j < names.length; j++) {

            const nameA = names[i];
            const nameB = names[j];

            const distanceAB = distanceMatrix[nameA][nameB];
            const distanceBA = distanceMatrix[nameB][nameA];

            if (
                Math.abs(distanceAB - distanceBA) > 1e-10
            ) {
                throw new Error(
                    "Distance matrix must be symmetrical."
                );
            }
        }
    }

    let clusters = names.map((name, index) => ({
        id: `cluster_${index}`,
        tree: {
            name,
            height: 0
        },
        size: 1
    }));

    const distances = {};

    function setDistance(idA, idB, value) {
        if (!distances[idA]) {
            distances[idA] = {};
        }

        if (!distances[idB]) {
            distances[idB] = {};
        }

        distances[idA][idB] = value;
        distances[idB][idA] = value;
    }

    function getDistance(idA, idB) {
        return distances[idA][idB];
    }

    for (let i = 0; i < names.length; i++) {
        for (let j = i + 1; j < names.length; j++) {
            setDistance(
                clusters[i].id,
                clusters[j].id,
                distanceMatrix[names[i]][names[j]]
            );
        }
    }

    let nextId = names.length;

    while (clusters.length > 1) {
        let smallestDistance = Infinity;
        let closestA = null;
        let closestB = null;

        for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                const distance = getDistance(
                    clusters[i].id,
                    clusters[j].id
                );

                if (distance < smallestDistance) {
                    smallestDistance = distance;
                    closestA = clusters[i];
                    closestB = clusters[j];
                }
            }
        }

        const newHeight = smallestDistance / 2;

        const newCluster = {
            id: `cluster_${nextId++}`,
            size: closestA.size + closestB.size,
            tree: {
                name: null,
                height: newHeight,
                left: {
                    node: closestA.tree,
                    branchLength: newHeight - closestA.tree.height
                },
                right: {
                    node: closestB.tree,
                    branchLength: newHeight - closestB.tree.height
                }
            }
        };

        for (const other of clusters) {
            if (
                other.id === closestA.id ||
                other.id === closestB.id
            ) {
                continue;
            }

            const distanceA = getDistance(closestA.id, other.id);
            const distanceB = getDistance(closestB.id, other.id);

            const newDistance =
                (distanceA * closestA.size +
                 distanceB * closestB.size) / newCluster.size;

            setDistance(newCluster.id, other.id, newDistance);
        }

        clusters = clusters.filter(
            cluster =>
                cluster.id !== closestA.id &&
                cluster.id !== closestB.id
        );

        clusters.push(newCluster);
    }

    return clusters[0].tree;
}

module.exports = {
    buildUpgmaTree
};
