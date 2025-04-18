# Sehtnaa Admin Dashboard

A comprehensive admin dashboard for managing all aspects of the Sehtnaa platform, with role-based access control and CRUD operations for all entities.

![Dashboard Preview](https://example.com/path-to-your-screenshot.png)

## Features

- **Role-based access control** (Admin, Super Admin)
- **CRUD operations** for all platform entities
- **Responsive design** works on all devices
- **Real-time data** with React Query
- **Beautiful UI** with PrimeReact components
- **Secure authentication** with JWT

## Pages Overview

### Home
- Dashboard overview with key metrics
- Quick access to important sections
- System status monitoring

### Users Management
| Feature          | Description                              |
|------------------|------------------------------------------|
| View Users       | List all users with filters and sorting  |
| Create User      | Add new users to the system              |
| Edit User        | Modify user details and status           |
| Delete User      | Remove users from the system             |
| Toggle Status    | Activate/deactivate user accounts        |

### Services Management
| Feature          | Description                              |
|------------------|------------------------------------------|
| View Services    | List all services with categories        |
| Create Service   | Add new services to the platform         |
| Edit Service     | Modify service details and pricing       |
| Delete Service   | Remove services from the platform        |
| Toggle Status    | Activate/deactivate services             |

### Categories Management
| Feature          | Description                              |
|------------------|------------------------------------------|
| View Categories  | List all service categories              |
| Create Category  | Add new service categories               |
| Edit Category    | Modify category details and ordering     |
| Delete Category  | Remove categories (if no services exist) |
| Toggle Status    | Show/hide categories                     |

### Providers Management
| Feature          | Description                              |
|------------------|------------------------------------------|
| View Providers   | List all service providers               |
| Verify Providers | Approve/reject provider applications     |
| Edit Provider    | Modify provider details                  |
| Suspend Provider | Temporarily disable provider accounts    |

### Documents Management
| Feature          | Description                              |
|------------------|------------------------------------------|
| View Documents   | List all required documents             |
| Add Documents | Add documents requirement for providers       |
| update Documents | Update documents requirement for providers       |
| delete Documents | Delete documents requirement for providers       |


### Complaints Management
| Feature          | Description                              |
|------------------|------------------------------------------|
| View Complaints  | List all user complaints                 |
| Resolve          | Mark complaint as resolved              |
| RESPONSE          | Send responses to users                  |


### Requests Management
| Feature          | Description                              |
|------------------|------------------------------------------|
| View Requests    | List all service requests                |
| Track Status     | Monitor request progress                 |


### Campaigns Management
| Feature          | Description                              |
|------------------|------------------------------------------|
| View Campaigns   | List all notification campaigns          |
| Create Campaign  | Send notifications to user groups        |
| View Stats       | Campaign delivery statistics             |


### Admins Management (Super Admin Only)
| Feature          | Description                              |
|------------------|------------------------------------------|
| View Admins      | List all admin accounts                  |
| Create Admin     | Add new admin accounts                   |
| Edit admin | Modify admin data              |
| Deactivate       | Temporarily disable admin accounts       |

## Technology Stack

- **Frontend**: React.js, PrimeReact, Tailwind CSS
- **State Management**: React Query, Context API
- **Routing**: React Router
- **Icons**: Lucide React
- **Forms**: Formik (if used)
- **Tables**: PrimeReact DataTable
- **Authentication**: JWT

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/sehtnaa-admin.git
   cd sehtnaa-admin