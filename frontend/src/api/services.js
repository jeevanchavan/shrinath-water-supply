import api from "./axios";

export const authApi = {
  login: (data)  => api.post("/auth/login", data),
  getMe: ()      => api.get("/auth/me"),
};

export const dashboardApi = {
  ownerStats:   () => api.get("/dashboard/owner"),
  ownerReports: () => api.get("/dashboard/owner/reports"),
  driverStats:  () => api.get("/dashboard/driver"),
};

export const tripApi = {
  getAll:         (params)       => api.get("/trips", { params }),
  create:         (data)         => api.post("/trips", data),
  updateStatus:   (id, status)   => api.patch(`/trips/${id}/status`, { status }),
  remove:         (id)           => api.delete(`/trips/${id}`),
  driverToday:    ()             => api.get("/trips/driver/today"),
  driverHistory:  (params)       => api.get("/trips/driver/history", { params }),
};

export const driverApi = {
  getAll:  ()        => api.get("/drivers"),
  create:  (data)    => api.post("/drivers", data),
  update:  (id, d)   => api.put(`/drivers/${id}`, d),
  remove:  (id)      => api.delete(`/drivers/${id}`),
};

export const customerApi = {
  getAll:  (params)  => api.get("/customers", { params }),
  create:  (data)    => api.post("/customers", data),
  update:  (id, d)   => api.put(`/customers/${id}`, d),
  remove:  (id)      => api.delete(`/customers/${id}`),
};

export const paymentApi = {
  summary: ()        => api.get("/payments/summary"),
  history: (params)  => api.get("/payments/history", { params }),
  collect: (data)    => api.post("/payments/collect", data),
};
