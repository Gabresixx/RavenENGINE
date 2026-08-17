# Character runtime

The character pipeline is intent-driven:

`player/AI intent -> trajectory -> procedural motion field -> predicted contacts -> constraints/IK -> pose buffer -> skinning`

Gameplay never directly rotates visual limbs. A future pose-search layer may augment the procedural field without changing the contract.

Close characters receive full contact prediction, hand/weapon constraints and secondary motion. Distant characters progressively reduce solver frequency and constraint count.
