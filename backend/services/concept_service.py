"""
Space Concept Service — Dual-mode educational glossary.
Features:
- "Explain Like I'm 10" (ELI10) plain-English analogies
- "College / Aerospace Engineering" technical rigour with mathematical formulas
- Real satellite examples anchored to the live CelesTrak catalog
- Visual diagram identifiers
"""
from __future__ import annotations
from typing import List, Optional
from models.features import SpaceConcept

SPACE_CONCEPTS_DATA: List[SpaceConcept] = [
    SpaceConcept(
        slug="orbit",
        title="What is an Orbit?",
        tagline="Falling towards Earth, but moving forward so fast you keep missing it.",
        icon="🌍",
        eli10="Imagine throwing a baseball. It curves down and hits the dirt. Throw it harder, it lands further. Now imagine throwing it so ridiculously fast (17,500 mph!) that as gravity pulls it down, the curved surface of the Earth curves away beneath it at the exact same rate! The ball is constantly in free fall, but it never hits the ground. That endless fall is what we call an orbit.",
        college="An orbit is a mathematically stable trajectory of an object bound to a central gravitational mass. In Newtonian celestial mechanics, it represents a balance between gravitational attraction ($F_g = \\frac{GMm}{r^2}$) and the necessary centripetal acceleration ($a_c = \\frac{v^2}{r}$). When forward tangential velocity precisely satisfies $v = \\sqrt{\\frac{\\mu}{r}}$, the trajectory closes into a circular geodesic.",
        formula="v = \\sqrt{\\frac{GM}{r}}",
        real_example_name="ISS (ZARYA)",
        real_example_id="25544",
        real_example_stat="Speed: 7.66 km/s · Altitude: 420 km",
        visual_type="orbit_circle",
    ),
    SpaceConcept(
        slug="apogee-perigee",
        title="Apogee & Perigee",
        tagline="The highest mountain and deepest valley of an elliptical orbit.",
        icon="🌌",
        eli10="Not all orbits are perfect circles; most are stretched out like eggs! When a satellite swings closest to the Earth, that point is called 'Perigee' (think 'P' for Proximity/Pocket). When it coasts to its furthest point out in the blackness of space, that's called 'Apogee' (think 'A' for Away). Just like a skateboarder on a half-pipe, the satellite travels fastest at perigee and slowest at apogee!",
        college="Kepler's First Law dictates that all planetary and satellite orbits form an ellipse with the barycenter at one focus. Perigee ($r_p = a(1 - e)$) represents the periapsis where gravitational potential energy is minimum and orbital velocity is maximum ($v_p = \\sqrt{\\frac{\\mu(1+e)}{a(1-e)}}$). Apogee ($r_a = a(1 + e)$) is the apoapsis with maximum potential energy and minimal velocity ($v_a = \\sqrt{\\frac{\\mu(1-e)}{a(1+e)}}$).",
        formula="r_a = a(1 + e), \\quad r_p = a(1 - e)",
        real_example_name="MOLNIYA 1-93",
        real_example_id="28163",
        real_example_stat="Perigee: 540 km · Apogee: 39,800 km",
        visual_type="ellipse",
    ),
    SpaceConcept(
        slug="inclination",
        title="Orbital Inclination",
        tagline="How tilted the satellite's racetrack is compared to Earth's waistline.",
        icon="📐",
        eli10="Think of Earth wearing an imaginary hula hoop around its equator (waist). If a satellite flies directly above the equator, its inclination is 0°. If it flies right over the North and South poles, its inclination is 90° (a polar orbit). The International Space Station has a tilt of 51.6° — which lets it fly over 90% of all the towns and cities where humans live on Earth!",
        college="Orbital inclination ($i$) is the dihedral angle between the orbital plane and the reference equatorial plane. It is bounded by $0^\\circ \\le i \\le 180^\\circ$. Orbits with $0^\\circ \\le i < 90^\\circ$ are prograde (rotating in the direction of Earth's spin); orbits with $90^\\circ < i \\le 180^\\circ$ are retrograde. A critical sun-synchronous inclination around $97^\\circ - 98^\\circ$ leverages Earth's nodal precession ($J_2$ gravitational harmonic) to maintain constant solar illumination angles.",
        formula="\\cos(i) = \\frac{h_z}{\\|\\vec{h}\\|}",
        real_example_name="ISS (ZARYA)",
        real_example_id="25544",
        real_example_stat="Inclination: 51.63° (Populated latitude coverage)",
        visual_type="tilt",
    ),
    SpaceConcept(
        slug="eccentricity",
        title="Orbital Eccentricity",
        tagline="How round or stretched-out an orbital path really is.",
        icon="🥚",
        eli10="Eccentricity is a score from 0 to 1 that measures how squished an orbit is. A score of 0 means a 100% perfect circle. As the number climbs closer to 1, the orbit stretches into an oval racetrack. If it hits 1.0 or higher, the satellite flies away into deep space and never comes back!",
        college="Eccentricity ($e$) is a dimensionless parameter characterizing the conic section of Keplerian motion: $e = \\sqrt{1 + \\frac{2\\varepsilon h^2}{\\mu^2}}$. For bound orbits, $e = 0$ is circular, $0 < e < 1$ is elliptical, $e = 1$ is parabolic escape, and $e > 1$ represents a hyperbolic interplanetary trajectory.",
        formula="e = \\frac{r_a - r_p}{r_a + r_p}",
        real_example_name="HUBBLE SPACE TELESCOPE",
        real_example_id="20580",
        real_example_stat="Eccentricity: 0.00028 (Virtually a perfect circle)",
        visual_type="ellipse",
    ),
    SpaceConcept(
        slug="escape-velocity",
        title="Escape Velocity",
        tagline="The cosmic speed limit you must break to leave planet Earth forever.",
        icon="🚀",
        eli10="Throw a ball in the air, Earth pulls it back down. Throw it with a rocket, Earth still wants to pull it down. But if you hit 25,000 miles per hour (11.2 kilometers every single second!), Earth's gravity can never pull you back! You break the invisible rubber band of Earth's gravity and journey out to the Moon, Mars, and the outer planets.",
        college="Escape velocity ($v_{esc}$) is the minimum speed an unpropelled body requires to escape the gravitational potential well of a primary mass to an infinite distance with zero residual kinetic energy. Derived from conservation of energy (setting mechanical energy $E = \\frac{1}{2}mv^2 - \\frac{GMm}{r} = 0$), yielding $v_{esc} = \\sqrt{\\frac{2GM}{r}} = \\sqrt{2} \\cdot v_{circ}$. At Earth's surface, $v_{esc} \\approx 11.186\\text{ km/s}$.",
        formula="v_{esc} = \\sqrt{\\frac{2GM}{r}} = \\sqrt{2} \\cdot v_{orbit}",
        real_example_name="VOYAGER 1 / 2",
        real_example_id="10321",
        real_example_stat="Heliocentric speed: 17 km/s (Interstellar space)",
        visual_type="velocity_curve",
    ),
    SpaceConcept(
        slug="geostationary",
        title="Geostationary Orbit (GEO)",
        tagline="The miraculous parking orbit that hovers over one spot forever.",
        icon="🛰️",
        eli10="Imagine a satellite that never moves in the sky! It's parked 22,236 miles above the equator. At that exact height, it takes exactly 24 hours to go around Earth once — which matches Earth's daily spin perfectly! Because both are spinning together at the same speed, a satellite dish on your roof can point at the exact same spot in the sky forever without moving.",
        college="A Geostationary Earth Orbit (GEO) is a circular geosynchronous orbit with an inclination of $i = 0^\\circ$ directly above Earth's geographic equator. Its orbital period strictly equals one sidereal day ($T = 86164.09\\text{ s}$). By Kepler's 3rd Law, the semi-major axis is $a = \\left(\\frac{\\mu T^2}{4\\pi^2}\\right)^{1/3} \\approx 42,164\\text{ km}$, placing it at an altitude of approximately $35,786\\text{ km}$ above sea level.",
        formula="a_{GEO} = \\left(\\frac{GM \\cdot T^2}{4\\pi^2}\\right)^{1/3} \\approx 42,164\\text{ km}",
        real_example_name="GOES-16 (WEATHER)",
        real_example_id="41866",
        real_example_stat="Altitude: 35,786 km · Period: 1,436 min (24 hrs)",
        visual_type="altitude_scale",
    ),
]


async def get_all_concepts() -> List[SpaceConcept]:
    """Return all educational space concepts."""
    return SPACE_CONCEPTS_DATA


async def get_concept_by_slug(slug: str) -> Optional[SpaceConcept]:
    """Find a specific concept by its slug."""
    for c in SPACE_CONCEPTS_DATA:
        if c.slug.lower() == slug.lower():
            return c
    return None
