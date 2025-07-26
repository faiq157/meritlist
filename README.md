# Merit List System

A comprehensive system for managing university admissions and merit lists with preference-based allocation.

## Features

### Core Features
- **Program Management**: Create, edit, and delete academic programs
- **Student Applications**: Manage student applications with detailed information
- **Merit List Generation**: Generate merit lists based on student performance
- **Seat Confirmation**: Confirm seats for admitted students
- **Master List**: View all student applications and their status

### New: Preference-Based Merit Lists
- **Preference Priority**: Students with higher preferences (1, 2, 3, etc.) are prioritized
- **Automatic Filtering**: Students are automatically removed from lower preference lists when they appear in higher preference lists
- **Real-time Updates**: Merit lists are updated based on current confirmed seats and existing merit lists
- **Visual Interface**: Easy-to-use admin interface for generating preference-based merit lists

## How Preference-Based Merit Lists Work

1. **Student Preferences**: Each student can rank programs from 1 to 50 in order of preference
2. **Priority System**: Students with preference 1 for a program get highest priority
3. **Automatic Filtering**: 
   - Students already confirmed for any program are excluded
   - Students already in merit lists with higher preferences are excluded
   - Only eligible students are included in the current merit list
4. **Merit Ranking**: Within each preference level, students are ranked by their aggregate score
5. **Version Control**: Each merit list is versioned for tracking changes

## API Endpoints

### Preference-Based Merit List
- `GET /api/meritlist/preference-based?programId={id}&programShortName={name}` - Generate merit list preview
- `POST /api/meritlist/preference-based` - Save preference-based merit list

### Standard Merit List
- `GET /api/meritlist?programId={id}` - Get merit list by program
- `POST /api/meritlist` - Create new merit list
- `DELETE /api/meritlist?programId={id}&version={v}` - Delete merit list version

### Programs
- `GET /api/programs` - Get all programs
- `POST /api/programs` - Create new program
- `PUT /api/programs` - Update program
- `DELETE /api/programs?id={id}` - Delete program

### Students
- `GET /api/students?id={programId}` - Get students for a program
- `GET /api/masterlist/studentlist` - Get all student applications

## Database Schema

### Key Tables
- `programs` - Academic programs
- `student_applications` - Student applications with preferences (preference_1 to preference_50)
- `merit_list` - Generated merit lists with version control
- `confirmed_seats` - Confirmed admissions
- `cancelled_meritlist` - Cancelled merit list entries

### Preference System
Students can rank up to 50 programs in order of preference:
- `preference_1` - First choice
- `preference_2` - Second choice
- ...
- `preference_50` - Fiftieth choice

## Usage

### Generating Preference-Based Merit Lists

1. Navigate to the admin panel
2. Click on "Preference Merit List" 
3. Select a program from the dropdown
4. Click "Generate Merit List Preview" to see eligible students
5. Review the preference distribution and student list
6. Click "Save Merit List" to store the final merit list

### Viewing Merit Lists

1. Go to any program's detail page
2. View the current merit list with preference information
3. Use the version selector to view different versions
4. Download merit lists as PDF or CSV

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up the database using the provided SQL schema
4. Configure database connection in `lib/mysql.js`
5. Run the development server: `npm run dev`

## Admin Access

- Username: `admin`
- Password: `password123`

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL/MariaDB
- **UI Components**: shadcn/ui
- **PDF Generation**: jsPDF
- **Data Export**: CSV/PDF download functionality
