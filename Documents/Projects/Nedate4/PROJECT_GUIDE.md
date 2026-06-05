# Project Guide

## Project Overview

Brief summary: Nedate4 is a small web app for coordinating meetups and availability.

## How to use this file

- Add high-level goals, conventions, and important notes about the project.
- Record how the tool (Copilot / automation) helps you: prompts, expected outputs, and tips.

## How the tool works for you

- What to include: common prompts, useful shortcuts, workflow examples, preferred output format.
- Where to store notes: update this file with anything teammates should know about the tool.

## Development & Running

Basic commands:

```
npm install
npm run dev
```

Add any environment variables, build steps, or platform-specific notes here.

## File structure (high level)

- `src/` — React app source
- `server/` — server code and db helpers
- `db.json` — simple local JSON data

## Contribution Notes

- How to open issues, run tests, and submit PRs.

## Contacts / Maintainers

- Add names, handles, or preferred contact methods for project maintainers.

---

Feel free to edit this file and expand sections with project-specific instructions and examples.

# Nedate md

Nedate is a personal social meetup request platform where people can request activities and hangouts with Ned.

**Requester user journey**

on the request form, requester can fill in

1. What - select the activity category
2. Who - enter details about the requester
3. When - select the proposed time
    1. recommended to user based on pre-configured available slots (GOOGLE CALENDAR INTEGRATION)
    2. but user can still select something else
4. Where - select which venue (if category = meals, walk, etc) / event (if category = bucket list)
    1. recommended to user based on pre-configured proposed venue/event for each category, but user can still select something else

**home page shortcuts**

in order to increase chance for being accepted, requester can select directly

1. bucket items events - events i am keen to have someone to do with
2. available timeslots - timeslots i am keen to fill with someone

**on the request form, pre-populate**

- category/event (if bucket item event is selected from home page)
- timeslot (if available timeslot is selected from home page)
- pitch (based on activity category selection)

**submission and approval user journey**

1. once submitted, user will
    1. see confirmation page
    2. get request link (where request can view status, pending vs approved vs rejected)
    3. get confirmation email (email integration)
2. i will get request notification email
3. i will approve/reject, can add comment
4. once approved/rejected
    1. user will get approved/rejected email
    2. status on request link / request in admin panel get updated
5. once approved, update calendar (google calendar integration)

**in admin panel**

1. view/approval requests
2. maintain venue/event - category mapping
3. setup auto approval list (those requests whose email addresses are pre-approved will get auto approval