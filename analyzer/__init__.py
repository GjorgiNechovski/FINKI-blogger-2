"""Generic microservice performance & reliability analyzer.

This package is the *engine* of the master's-thesis toolkit: it is deliberately
system-agnostic. It knows nothing about blogs, Kong, or any specific language.
A concrete system (e.g. this blogging platform) is described by a separate spec
and pointed at by the engine.

Layers (thesis chapters):
    Layer 1  models.queueing   -- M/M/c performance
    Layer 2  models.ctmc       -- availability / MTTF / MTTR   (later phase)
    Layer 3  models.rbd        -- reliability block diagram + fault tree (later)
    Layer 4  models.sensitivity-- parameter sweeps             (later phase)
"""

__version__ = "0.1.0"
