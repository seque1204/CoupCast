# 🐾 CoupCats: Forecasting Coup Risk Through Interactive Policy Simulation

**CoupCats** is an interactive web application designed to forecast the likelihood of coups across all countries from **1950 to the present**, using a logistic regression model powered by rich political and economic datasets.

Built for **policy makers and advisors**, the platform not only visualizes historical and forecasted instability but also empowers users to simulate how **policy changes** could impact a nation’s coup risk.

---

## 🌍 Project Scope

- **Objective**: Use machine learning to identify and quantify the policy-related drivers of coup risk.
- **Temporal Scope**: Global coverage, 1950–present.
- **Primary Use Case**: Enabling real-time “what-if” policy experimentation for decision makers and political analysts.

---

## 🧠 Model & Methodology

- **Model Type**: Logistic regression classifier.
- **Engine**: Trained in **R**, exported and visualized via a React frontend.
- **Data**: Merged external datasets capturing over 55 political, social, and economic indicators.
- **Validation**: Currently in exploratory phase; model calibration and real-world performance analysis underway.
- **Update Cycle**: Monthly forecast updates, with instant recalculation when sliders are used to simulate policy changes.

---

## 🌐 Interactive Features

- **World Map** with a progressive gradient showing forecasted coup risk by country.
- **Country-Specific Pages** that allow users to:
  - Adjust selected policy levers (e.g., governance score, economic variables) via **sliders**.
  - See how risk changes dynamically based on user inputs.
- **Relative Rankings** to compare countries’ predicted instability.

> 🧭 Designed as a **read-only policy exploration tool** — no user uploads required.

---

## ⚙️ Tech Stack

- **Frontend**: React + Vite  
- **Backend Modeling**: R (logistic regression, preprocessing)  
- **Hosting**: AWS Amplify  
- **Visualization**: Dynamic map and sliders with responsive interaction

---

## 📈 Intended Impact

- **Audience**: Policy makers, consulting agencies, and global risk analysts.
- **Goal**: Help users simulate potential outcomes of interventions and preemptively address emerging instability.

---

## 🎓 Academic Background

This project was developed as a **Computer Science Capstone** and part of a **selective interdisciplinary course** on global instability and public policy. It was presented in **Washington D.C.** to major consulting firms working in international development and security.

---


## 💬 Contact & Collaboration

If you're interested in contributing, collaborating, or using CoupCats in your organization, feel free to reach out via [GitHub Issues](../../issues) or [LinkedIn](https://www.linkedin.com/in/josequeira).
