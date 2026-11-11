
import sys
from io import StringIO

from Bio import Phylo


# STEP 1: Read Newick text from standard input.
newick_text = sys.stdin.read().strip()

if not newick_text:
    raise SystemExit("ERROR: No Newick input received.")


# STEP 2: Parse the Newick representation.
try:
    tree = Phylo.read(StringIO(newick_text), "newick")
except Exception as error:
    raise SystemExit(f"ERROR: Newick parsing failed: {error}")


# STEP 3: Define the expected scientific taxa.
expected_taxa = {
    "Homo sapiens",
    "Pan troglodytes",
    "Gorilla gorilla"
}


# STEP 4: Extract the taxa recognized by Biopython.
terminals = tree.get_terminals()

observed_taxa = {
    terminal.name
    for terminal in terminals
}


# STEP 5: Verify the organism count.
if len(terminals) != 3:
    raise SystemExit(
        f"ERROR: Expected 3 organisms, found {len(terminals)}."
    )


# STEP 6: Verify that all taxon names survived parsing.
if observed_taxa != expected_taxa:
    raise SystemExit(
        f"ERROR: Taxon mismatch. Found: {observed_taxa}"
    )


# STEP 7: Verify branch lengths.
for clade in tree.find_clades():

    if clade is tree.root:
        continue

    if (
        clade.branch_length is None
        or clade.branch_length < 0
    ):
        raise SystemExit(
            "ERROR: Invalid branch length detected."
        )


# STEP 8: Report successful verification.
print("\n===== NEWICK INTEROPERABILITY TEST =====")

print("Parser: Biopython")

print("Format: Newick")

print(f"Organisms recognized: {len(terminals)}")

print("Taxon names:")

for taxon in sorted(observed_taxa):
    print(f" - {taxon}")

print(
    f"Total branch length: {tree.total_branch_length()}"
)

print("\nSUCCESS: Independent Newick parsing completed.")
