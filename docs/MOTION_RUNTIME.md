# Motion runtime

RAVEN motion is not authored as direct mesh rotations and is not based on a single sinusoidal walk cycle.

The current procedural spine is:

`intent -> trajectory prediction -> contact-phase gait planner -> predicted foot contacts -> foot locks -> balance correction -> IK/constraint stack -> pose -> skinning`

Foot gait uses explicit plant, transfer, toe-off, swing and heel-strike regions with polynomial curves. Recoil is an impulse/spring system distributed across weapon, wrists, shoulder, spine and only a small camera component.

The long-term contract still allows learned/recorded pose search or motion-matching data to augment pose generation without changing gameplay intent or contact solvers.
