// // // import React, { useState } from 'react';
// // // import { Outlet } from 'react-router-dom';
// // // import Sidebar from '../components/Sidebar';
// // // import Topbar from '../components/Topbar';

// // // const DashboardLayout = () => {
// // //   const [sidebarOpen, setSidebarOpen] = useState(false);

// // //   return (
// // //     <div className="dashboard-layout">
// // //       <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
// // //       <div className="dashboard-main">
// // //         <Topbar onToggle={() => setSidebarOpen(s => !s)} />
// // //         <main className="dashboard-body">
// // //           <Outlet />
// // //         </main>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default DashboardLayout;
// // // import React, { useState } from 'react';
// // // import { Outlet } from 'react-router-dom';
// // // import Sidebar from '../components/Sidebar';
// // // import Topbar from '../components/Topbar';

// // // const DashboardLayout = () => {
// // //   const [sidebarOpen, setSidebarOpen] = useState(false);

// // //   return (
// // //     <div className="dashboard-layout">
// // //       <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
// // //       <div className="dashboard-main">
// // //         <Topbar onToggle={() => setSidebarOpen(s => !s)} />
// // //         <main className="dashboard-body">
// // //           <Outlet />
// // //         </main>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default DashboardLayout;
// // import React, { useState, useEffect } from 'react';
// // import { Outlet } from 'react-router-dom';
// // import Sidebar from '../components/Sidebar';
// // import Topbar from '../components/Topbar';

// // const DashboardLayout = () => {
// //   const [sidebarOpen, setSidebarOpen] = useState(false);

// //   // Lock body scroll when sidebar is open on mobile
// //   useEffect(() => {
// //     if (sidebarOpen) {
// //       document.body.classList.add('sidebar-is-open');
// //     } else {
// //       document.body.classList.remove('sidebar-is-open');
// //     }
// //     return () => document.body.classList.remove('sidebar-is-open');
// //   }, [sidebarOpen]);

// //   return (
// //     <div className="dashboard-layout">
// //       <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
// //       <div className="dashboard-main">
// //         <Topbar onToggle={() => setSidebarOpen(s => !s)} />
// //         <main className="dashboard-body">
// //           <Outlet />
// //         </main>
// //       </div>
// //     </div>
// //   );
// // };

// // export default DashboardLayout;
// import React, { useState, useEffect } from 'react';
// import { Outlet } from 'react-router-dom';
// import Sidebar from '../components/Sidebar';
// import Topbar from '../components/Topbar';
// import ChatBot from '../components/ChatBot'; // ← import the chatbot

// const DashboardLayout = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // Lock body scroll when sidebar is open on mobile
//   useEffect(() => {
//     if (sidebarOpen) {
//       document.body.classList.add('sidebar-is-open');
//     } else {
//       document.body.classList.remove('sidebar-is-open');
//     }
//     return () => document.body.classList.remove('sidebar-is-open');
//   }, [sidebarOpen]);

//   return (
//     <div className="dashboard-layout">
//       <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
//       <div className="dashboard-main">
//         <Topbar onToggle={() => setSidebarOpen(s => !s)} />
//         <main className="dashboard-body">
//           <Outlet />
//         </main>
//       </div>

//       {/* Floating AI Career Assistant — visible across all employee pages */}
//       <ChatBot />
//     </div>
//   );
// };

// export default DashboardLayout;
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ChatBot from '../components/ChatBot';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('sidebar-is-open');
    } else {
      document.body.classList.remove('sidebar-is-open');
    }
    return () => document.body.classList.remove('sidebar-is-open');
  }, [sidebarOpen]);

  return (
    <div className="employee-layout">
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="dashboard-main">
        <Topbar onToggle={() => setSidebarOpen(s => !s)} />
        <main className="dashboard-body">
          <Outlet />
        </main>
      </div>
      <ChatBot />
    </div>
  );
};

export default DashboardLayout;