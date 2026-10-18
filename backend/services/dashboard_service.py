"""
Dashboard Service — Delivers personalized space dashboards tailored by user persona:
- Students (Quizzes, learning missions, science challenges)
- Amateur Astronomers (Visible satellite passes, sighting schedules, magnitude)
- Small Businesses (Commercial Earth observation, imaging, IoT services)
- Educators (Classroom topics, physics labs, Kepler demonstrations)
"""
from __future__ import annotations
from typing import Dict, Any
from models.features import (
    RoleDashboardData, QuizQuestion, VisiblePass, CommercialService, ClassroomTopic
)

# ── 1. Student Persona Data ──────────────────────────────
STUDENT_QUIZ: list[QuizQuestion] = [
    QuizQuestion(
        id=1,
        question="Why doesn't the International Space Station fall down and crash into the Earth?",
        options=[
            "There is zero gravity in space, so it floats naturally.",
            "Its engines are constantly firing 24/7 to push it upward.",
            "It moves forward at 17,500 mph, so Earth curves away as it falls.",
            "It is tethered to the Moon by gravitational magnets.",
        ],
        correct_index=2,
        explanation="Earth's gravity at the ISS altitude (420 km) is still 90% as strong as on the ground! The ISS stays in orbit because it moves forward so fast (~7.66 km/s) that as gravity pulls it downward, the Earth's spherical surface curves away at the exact same rate. It is literally falling around the Earth forever!",
        hint="Think about Isaac Newton's cannonball experiment!"
    ),
    QuizQuestion(
        id=2,
        question="How many sunrises and sunsets do astronauts on the ISS witness in a single 24-hour day?",
        options=[
            "1 sunrise and 1 sunset (just like on Earth)",
            "Roughly 16 sunrises and 16 sunsets",
            "None, space is always completely dark",
            "365 sunrises in one day",
        ],
        correct_index=1,
        explanation="Because the ISS completes an entire orbit around planet Earth every ~92 minutes, it circles the globe approximately 15.5 to 16 times in 24 hours. That means the crew sees the sun rise and set every 45 minutes!",
        hint="Divide 24 hours (1440 minutes) by the ISS orbital period (~92 minutes)."
    ),
    QuizQuestion(
        id=3,
        question="What is the special altitude for Geostationary satellites that hover over one spot?",
        options=[
            "400 km (Low Earth Orbit)",
            "2,000 km (Medium Earth Orbit)",
            "35,786 km (Geostationary Ring)",
            "384,400 km (Lunar Distance)",
        ],
        correct_index=2,
        explanation="At exactly 35,786 km (22,236 miles) above the equator, a satellite takes exactly 24 sidereal hours to complete an orbit — perfectly matching Earth's rotation speed! This is why TV dishes can stay pointed at one spot in the sky.",
        hint="It's almost 100 times higher than the International Space Station."
    ),
    QuizQuestion(
        id=4,
        question="What orbital parameter tells you how 'oval' or 'squished' an orbit is?",
        options=[
            "Inclination",
            "Eccentricity",
            "Right Ascension",
            "Semi-major Axis",
        ],
        correct_index=1,
        explanation="Eccentricity (e) measures the circularity of an orbit. An eccentricity of 0 is a perfect circle. Numbers between 0 and 1 represent stretched ellipses.",
        hint="Think of eccentric shapes like an oval egg."
    ),
    QuizQuestion(
        id=5,
        question="Which space agency launched the Hubble Space Telescope in 1990?",
        options=[
            "NASA & ESA",
            "ISRO",
            "SpaceX",
            "JAXA",
        ],
        correct_index=0,
        explanation="The Hubble Space Telescope was launched aboard Space Shuttle Discovery in April 1990 as a flagship collaboration between NASA and the European Space Agency (ESA).",
        hint="It was deployed using the Space Shuttle's robotic arm."
    ),
]

# ── 2. Astronomer Visible Passes ─────────────────────────
ASTRONOMER_PASSES: list[VisiblePass] = [
    VisiblePass(
        satellite_name="ISS (International Space Station)",
        norad_id=25544,
        rise_time="Tonight · 19:42 Local",
        max_elevation="78° (Directly overhead)",
        magnitude="-3.8 (Brighter than Venus!)",
        naked_eye=True,
        direction="South-West to North-East",
    ),
    VisiblePass(
        satellite_name="Tiangong Space Station (CSS)",
        norad_id=48274,
        rise_time="Tonight · 20:55 Local",
        max_elevation="62°",
        magnitude="-1.5 (Easily visible)",
        naked_eye=True,
        direction="West to South-East",
    ),
    VisiblePass(
        satellite_name="Hubble Space Telescope",
        norad_id=20580,
        rise_time="Tomorrow · 04:18 Local",
        max_elevation="34°",
        magnitude="+2.1 (Binoculars recommended)",
        naked_eye=False,
        direction="South to South-East",
    ),
    VisiblePass(
        satellite_name="Envisat (Earth Observation Giant)",
        norad_id=27386,
        rise_time="Tomorrow · 21:12 Local",
        max_elevation="54°",
        magnitude="+1.8 (Naked eye in dark skies)",
        naked_eye=True,
        direction="North to South",
    ),
]

# ── 3. Small Business / Commercial Services ───────────────
COMMERCIAL_SERVICES: list[CommercialService] = [
    CommercialService(
        category="High-Resolution Optical Imaging",
        constellation="Planet Labs SkySat / SuperDove",
        resolution="0.5m - 3.0m per pixel",
        revisit_rate="Daily global scan (every 24 hours)",
        business_use_case="Agricultural crop yield monitoring, construction site tracking, supply chain port logistics, and insurance disaster claims.",
    ),
    CommercialService(
        category="Synthetic Aperture Radar (SAR)",
        constellation="Capella Space / ICEYE",
        resolution="0.25m - 1.0m radar imaging",
        revisit_rate="Sub-daily (Under 4 hours)",
        business_use_case="All-weather, day-and-night imaging through clouds and rain. Ideal for maritime ship tracking, oil spill detection, and flood monitoring.",
    ),
    CommercialService(
        category="Low-Latency Satellite Broadband",
        constellation="SpaceX Starlink / Eutelsat OneWeb",
        resolution="N/A (Communications)",
        revisit_rate="Continuous (Constellation mesh)",
        business_use_case="Enterprise connectivity for remote mining, offshore energy platforms, rural retail, and emergency backup internet.",
    ),
    CommercialService(
        category="Internet-of-Things (IoT) Asset Tracking",
        constellation="Swarm Technologies / Iridium NEXT",
        resolution="N/A (Telemetry sensors)",
        revisit_rate="Real-time / Hourly",
        business_use_case="Affordable sensor monitoring for shipping containers, weather buoys, smart irrigation valves, and livestock tracking.",
    ),
]

# ── 4. Educator Classroom Topics ─────────────────────────
EDUCATOR_TOPICS: list[ClassroomTopic] = [
    ClassroomTopic(
        grade_level="Middle School (Ages 11-14)",
        title="Why Astronauts are Weightless: Free Fall vs Zero Gravity",
        physics_principle="Gravity is NOT zero in space! Weightlessness is an illusion created by perpetual free fall.",
        activity="Classroom elevator drop experiment with plastic cups of water demonstrating apparent weightlessness.",
        satellite_lab="Inspect the ISS telemetry: Show students that gravity at 420 km is ~8.9 m/s² (nearly 91% of sea-level gravity!).",
    ),
    ClassroomTopic(
        grade_level="High School Physics (Ages 15-18)",
        title="Kepler's Third Law in Action: Altitude vs Period",
        physics_principle="The square of the orbital period ($T^2$) is directly proportional to the cube of the semi-major axis ($a^3$).",
        activity="Plot satellite altitude on the X-axis against period on the Y-axis using live CelesTrak satellites.",
        satellite_lab="Compare ISS (altitude 420 km, period 92 min) with GPS (altitude 20,200 km, period 718 min) and GEO (altitude 35,786 km, period 1436 min).",
    ),
    ClassroomTopic(
        grade_level="AP Physics / College Mechanics",
        title="Orbital Energy & Delta-V: Vis-Viva Equation",
        physics_principle="Conservation of specific mechanical energy: $\\frac{v^2}{2} - \\frac{\\mu}{r} = -\\frac{\\mu}{2a}$.",
        activity="Calculate the Delta-V required for a Hohmann transfer from LEO to Geostationary Orbit.",
        satellite_lab="Examine an elliptical satellite (Molniya) and calculate its kinetic vs potential energy ratio at apogee versus perigee.",
    ),
]


async def get_dashboard_for_role(role: str) -> RoleDashboardData:
    """Return tailored data bundle based on user persona."""
    clean_role = role.lower().strip()

    if clean_role == "astronomer":
        return RoleDashboardData(
            role="astronomer",
            headline="Naked-Eye & Stargazer Observation Deck",
            subtext="Track bright satellite passes, optical magnitude, and overhead transit predictions for tonight's sky.",
            quick_stats={
                "Visible Passes Tonight": "4 Bright Passes",
                "Brightest Object": "ISS (-3.8 Mag)",
                "Night Sky Quality": "Optimal Viewing",
                "Next Transit": "19:42 Local Time",
            },
            visible_passes=ASTRONOMER_PASSES,
        )

    elif clean_role == "business":
        return RoleDashboardData(
            role="business",
            headline="Commercial Space & Earth Observation Intelligence",
            subtext="Explore active satellite service tiers, imaging resolutions, constellation revisit rates, and commercial applications.",
            quick_stats={
                "Commercial Sats Tracked": "6,400+ Active",
                "Best Optical Resolution": "30 cm / pixel",
                "SAR Revisit Latency": "< 4 hours",
                "Broadband Latency": "25-35 ms",
            },
            commercial_services=COMMERCIAL_SERVICES,
        )

    elif clean_role == "educator":
        return RoleDashboardData(
            role="educator",
            headline="Curriculum & Space Physics Teaching Modules",
            subtext="Engage students with live telemetry lab activities, Newton's laws demonstrations, and Keplerian mechanics.",
            quick_stats={
                "Lesson Modules": "3 Grade Bands",
                "Target Physics": "Newtonian & Keplerian",
                "Live Telemetry Labs": "Enabled",
                "Classroom Format": "Interactive & Lab Ready",
            },
            classroom_topics=EDUCATOR_TOPICS,
        )

    # Default to 'student'
    return RoleDashboardData(
        role="student",
        headline="Student Space Cadet Mission Hub",
        subtext="Master orbital mechanics, tackle interactive space trivia quizzes, and explore how spacecraft navigate physics.",
        quick_stats={
            "Active Learning Missions": "5 Challenges",
            "Quiz Questions Available": "5 Interactive",
            "Difficulty": "Student Friendly",
            "Live Telemetry Mapped": "280+ Satellites",
        },
        quiz=STUDENT_QUIZ,
    )


get_role_dashboard = get_dashboard_for_role
