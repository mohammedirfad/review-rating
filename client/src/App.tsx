import { format } from "date-fns";
import { CalendarDays, Heart, LocateFixed, MapPin, Search, Share2, Star, UserRound, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { authApi, companyApi, getErrorMessage, reviewApi } from "./api";
import type { AuthMode, Company, Review, User } from "./types";

const pageSize = 10;
const maxLogoBytes = 1024 * 1024;

type FieldErrors<T extends string> = Partial<Record<T, string>>;

function isEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value);
}

function Stars({ value, large = false, onChange }: { value: number; large?: boolean; onChange?: (value: number) => void }) {
  return (
    <span className={large ? "stars stars-large" : "stars"}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button className="star-button" disabled={!onChange} key={star} onClick={() => onChange?.(star)} type="button" aria-label={`${star} star`}>
          <Star fill={star <= Math.round(value) ? "#f4b400" : "#d8d8d8"} color={star <= Math.round(value) ? "#f4b400" : "#d8d8d8"} />
        </button>
      ))}
    </span>
  );
}

function LogoMark({ company }: { company: Company }) {
  const initials = (company.logoText || company.name.slice(0, 2)).toUpperCase();
  return (
    <div className="company-logo" style={{ background: company.logoColor }}>
      {company.logoUrl ? <img src={company.logoUrl} alt={`${company.name} logo`} /> : <span>{initials}</span>}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="field-error">{message}</span> : null;
}

function nameInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";
}

function Header({
  user,
  search,
  onSearch,
  onAuth,
  onProfile,
  onLogout
}: {
  user: User | null;
  search: string;
  onSearch: (value: string) => void;
  onAuth: (mode: AuthMode) => void;
  onProfile: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="topbar">
      <button className="brand" type="button">
        <span className="brand-icon"><Star fill="#fff" size={20} /></span>
        <span>Review<span>&amp;</span><b>RATE</b></span>
      </button>
      <label className="search-box">
        <input value={search} onChange={(event) => onSearch(event.target.value)} aria-label="Search companies" />
        <Search color="#8912ff" size={22} />
      </label>
      <nav className="nav-actions">
        {user ? (
          <>
            <button onClick={onProfile} type="button" className="plain-link profile-link"><UserRound size={17} /> {user.name}</button>
            <button onClick={onLogout} type="button" className="plain-link">Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => onAuth("signup")} type="button" className="plain-link">SignUp</button>
            <button onClick={() => onAuth("login")} type="button" className="plain-link">Login</button>
          </>
        )}
      </nav>
    </header>
  );
}

function CompanyCard({ company, onOpen }: { company: Company; onOpen: (company: Company) => void }) {
  return (
    <article className="company-card">
      <LogoMark company={company} />
      <div className="company-main">
        <h2>{company.name}</h2>
        <p><MapPin size={13} />{company.location}</p>
        {company.description && <p className="company-description">{company.description}</p>}
        <div className="rating-line">
          <b>{company.averageRating.toFixed(1)}</b>
          <Stars value={company.averageRating} />
          <b className="reviews-count">{company.reviewCount} Reviews</b>
        </div>
      </div>
      <div className="company-side">
        <span>Founded on {format(new Date(company.foundedOn), "dd-MM-yyyy")}</span>
        <button type="button" onClick={() => onOpen(company)} className="dark-button">Detail Review</button>
      </div>
    </article>
  );
}

function ModalShell({ children, wide = false, onClose }: { children: React.ReactNode; wide?: boolean; onClose: () => void }) {
  return (
    <div className="overlay">
      <div className={wide ? "modal modal-wide" : "modal"}>
        <div className="orb one" />
        <div className="orb two" />
        <button type="button" className="close" onClick={onClose}><X size={20} /></button>
        {children}
      </div>
    </div>
  );
}

function AuthModal({ mode, onClose, onDone }: { mode: AuthMode; onClose: () => void; onDone: (user: User, token: string) => void }) {
  const [active, setActive] = useState(mode);
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<"name" | "email" | "password">>({});
  const [submitting, setSubmitting] = useState(false);

  function switchMode(next: AuthMode) {
    setActive(next);
    setErrors({});
  }

  function validate() {
    const form = active === "signup" ? signupForm : loginForm;
    const nextErrors: FieldErrors<"name" | "email" | "password"> = {};
    if (active === "signup" && !signupForm.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!isEmail(form.email)) nextErrors.email = "Enter a valid email.";
    if (!form.password) nextErrors.password = "Password is required.";
    else if (form.password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const response = active === "signup" ? await authApi.signup(signupForm) : await authApi.login(loginForm);
      onDone(response.data.user, response.data.token);
      toast.success(active === "signup" ? "Account created." : "Logged in.");
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell onClose={onClose}>
      <form className="modal-form auth-form" onSubmit={submit} noValidate>
        <h2>{active === "signup" ? "SignUp" : "Login"}</h2>
        <div className="auth-tabs">
          <button type="button" className={active === "signup" ? "tab active" : "tab"} onClick={() => switchMode("signup")}>SignUp</button>
          <button type="button" className={active === "login" ? "tab active" : "tab"} onClick={() => switchMode("login")}>Login</button>
        </div>
        {active === "signup" ? (
          <>
            <label>Full Name<input value={signupForm.name} onChange={(event) => setSignupForm({ ...signupForm, name: event.target.value })} placeholder="Enter" /></label>
            <FieldError message={errors.name} />
            <label>Email<input value={signupForm.email} onChange={(event) => setSignupForm({ ...signupForm, email: event.target.value })} placeholder="Enter" /></label>
            <FieldError message={errors.email} />
            <label>Password<input type="password" value={signupForm.password} onChange={(event) => setSignupForm({ ...signupForm, password: event.target.value })} placeholder="Enter" /></label>
            <FieldError message={errors.password} />
          </>
        ) : (
          <>
            <label>Email<input value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} placeholder="Enter" /></label>
            <FieldError message={errors.email} />
            <label>Password<input type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} placeholder="Enter" /></label>
            <FieldError message={errors.password} />
          </>
        )}
        <button className="gradient-button modal-save" disabled={submitting} type="submit">{submitting ? "..." : active === "signup" ? "Create" : "Login"}</button>
      </form>
    </ModalShell>
  );
}

function CompanyModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", location: "", foundedOn: "", city: "", logoUrl: "", description: "" });
  const [errors, setErrors] = useState<FieldErrors<"name" | "location" | "foundedOn" | "city" | "logoUrl" | "description">>({});

  function handleLogoUpload(file: File | undefined) {
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpe?g|webp)$/)) {
      setErrors((current) => ({ ...current, logoUrl: "Upload a PNG, JPG, JPEG, or WEBP logo." }));
      return;
    }
    if (file.size > maxLogoBytes) {
      setErrors((current) => ({ ...current, logoUrl: "Logo must be 1 MB or smaller." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, logoUrl: String(reader.result) }));
      setErrors((current) => ({ ...current, logoUrl: undefined }));
    };
    reader.onerror = () => setErrors((current) => ({ ...current, logoUrl: "Could not read logo file." }));
    reader.readAsDataURL(file);
  }

  function validate() {
    const nextErrors: FieldErrors<"name" | "location" | "foundedOn" | "city" | "logoUrl" | "description"> = {};
    if (!form.name.trim()) nextErrors.name = "Company name is required.";
    if (!form.location.trim()) nextErrors.location = "Location is required.";
    if (!form.foundedOn) nextErrors.foundedOn = "Founded date is required.";
    if (!form.city.trim()) nextErrors.city = "City is required.";
    if (form.logoUrl && !/^data:image\/(png|jpe?g|webp);base64,/i.test(form.logoUrl)) nextErrors.logoUrl = "Upload a valid logo image.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    try {
      await companyApi.create({
        ...form,
        logoUrl: form.logoUrl.trim(),
        description: form.description.trim()
      });
      onCreated();
      toast.success("Company added.");
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <ModalShell wide onClose={onClose}>
      <form className="modal-form company-modal" onSubmit={submit} noValidate>
        <h2>Add Company</h2>
        <label>Company name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Enter..." /></label>
        <FieldError message={errors.name} />
        <label>Location<span className="input-icon"><input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Select Location" /><MapPin size={18} /></span></label>
        <FieldError message={errors.location} />
        <label>Founded on<span className="input-icon date-input"><input type="date" value={form.foundedOn} onChange={(event) => setForm({ ...form, foundedOn: event.target.value })} /><CalendarDays size={18} /></span></label>
        <FieldError message={errors.foundedOn} />
        <label>City<input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="City" /></label>
        <FieldError message={errors.city} />
        <label>Logo
          <input className="file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleLogoUpload(event.target.files?.[0])} />
        </label>
        {form.logoUrl && (
          <div className="logo-preview">
            <img src={form.logoUrl} alt="Company logo preview" />
            <button type="button" onClick={() => setForm({ ...form, logoUrl: "" })}>Remove</button>
          </div>
        )}
        <FieldError message={errors.logoUrl} />
        <label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" /></label>
        <FieldError message={errors.description} />
        <button className="gradient-button modal-save" type="submit">Save</button>
      </form>
    </ModalShell>
  );
}

function ratingMessage(rating: number) {
  if (rating <= 0) return "Select rating";
  if (rating === 1) return "Very bad";
  if (rating === 2) return "Bad";
  if (rating === 3) return "Average";
  if (rating === 4) return "Satisfied";
  return "Excellent";
}

function ReviewModal({ company, user, onClose, onSaved }: { company: Company; user: User; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ fullName: user.name, subject: "", text: "", rating: 0 });
  const [errors, setErrors] = useState<FieldErrors<"fullName" | "subject" | "text" | "rating">>({});

  function validate() {
    const nextErrors: FieldErrors<"fullName" | "subject" | "text" | "rating"> = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!form.subject.trim()) nextErrors.subject = "Subject is required.";
    if (!form.text.trim()) nextErrors.text = "Review is required.";
    else if (form.text.trim().length < 10) nextErrors.text = "Review must be at least 10 characters.";
    if (form.rating < 1) nextErrors.rating = "Rating is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    try {
      await reviewApi.create(company._id, form);
      toast.success("Review added.");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <ModalShell wide onClose={onClose}>
      <form className="modal-form review-modal" onSubmit={submit} noValidate>
        <h2>Add Review</h2>
        <label>Full Name<input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="Enter" /></label>
        <FieldError message={errors.fullName} />
        <label>Subject<input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} placeholder="Enter" /></label>
        <FieldError message={errors.subject} />
        <label>Enter your Review<textarea value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} placeholder="Description" /></label>
        <FieldError message={errors.text} />
        <div className="rating-picker">
          <h3>Rating</h3>
          <div><Stars large value={form.rating} onChange={(rating) => setForm({ ...form, rating })} /><span>{ratingMessage(form.rating)}</span></div>
          <FieldError message={errors.rating} />
        </div>
        <button className="gradient-button modal-save" type="submit">Save</button>
      </form>
    </ModalShell>
  );
}

function ProfileModal({ user, onClose, onSaved }: { user: User; onClose: () => void; onSaved: (user: User) => void }) {
  const [form, setForm] = useState({ name: user.name, avatarUrl: user.avatarUrl, bio: user.bio });

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const response = await authApi.updateProfile(form);
      onSaved(response.data.user);
      toast.success("Profile updated.");
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <ModalShell onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <h2>Edit Profile</h2>
        <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Image URL<input value={form.avatarUrl} onChange={(event) => setForm({ ...form, avatarUrl: event.target.value })} placeholder="https://..." /></label>
        <label>Bio<textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} /></label>
        <button className="gradient-button modal-save" type="submit">Save</button>
      </form>
    </ModalShell>
  );
}

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyTotal, setCompanyTotal] = useState(0);
  const [companyPage, setCompanyPage] = useState(1);
  const [companyHasMore, setCompanyHasMore] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [selected, setSelected] = useState<Company | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewHasMore, setReviewHasMore] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [sort, setSort] = useState("name");
  const [reviewSortValue, setReviewSortValue] = useState("date");
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [companyModal, setCompanyModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const companySentinel = useRef<HTMLDivElement | null>(null);
  const reviewSentinel = useRef<HTMLDivElement | null>(null);

  const loadCompanies = useCallback(async (page: number, reset = false) => {
    setCompaniesLoading(true);
    try {
      const response = await companyApi.list({ search, city, sort, page, limit: pageSize });
      setCompanies((current) => (reset ? response.data.companies : [...current, ...response.data.companies]));
      setCompanyTotal(response.data.total);
      setCompanyPage(response.data.page);
      setCompanyHasMore(response.data.hasMore);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setCompanies([]);
      setCompanyTotal(0);
      setCompanyHasMore(false);
    } finally {
      setCompaniesLoading(false);
    }
  }, [city, search, sort]);

  const loadReviews = useCallback(async (company: Company, page: number, reset = false) => {
    setReviewsLoading(true);
    try {
      const response = await reviewApi.list(company._id, { sort: reviewSortValue, page, limit: pageSize });
      setReviews((current) => (reset ? response.data.reviews : [...current, ...response.data.reviews]));
      setReviewTotal(response.data.total);
      setReviewPage(response.data.page);
      setReviewHasMore(response.data.hasMore);
      const detail = await companyApi.detail(company._id);
      setSelected(detail.data.company);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setReviews([]);
      setReviewTotal(0);
      setReviewHasMore(false);
    } finally {
      setReviewsLoading(false);
    }
  }, [reviewSortValue]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadCompanies(1, true);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [loadCompanies]);

  useEffect(() => {
    const token = localStorage.getItem("review-rate-token");
    if (!token) return;
    authApi.me().then((response) => setUser(response.data.user)).catch(() => localStorage.removeItem("review-rate-token"));
  }, []);

  useEffect(() => {
    if (!selected) return;
    loadReviews(selected, 1, true);
  }, [loadReviews, selected?._id]);

  useEffect(() => {
    const node = companySentinel.current;
    if (!node || selected) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && companyHasMore && !companiesLoading) loadCompanies(companyPage + 1);
    }, { rootMargin: "180px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [companyHasMore, companiesLoading, companyPage, loadCompanies, selected]);

  useEffect(() => {
    const node = reviewSentinel.current;
    if (!node || !selected) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && reviewHasMore && !reviewsLoading) loadReviews(selected, reviewPage + 1);
    }, { rootMargin: "180px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadReviews, reviewHasMore, reviewPage, reviewsLoading, selected]);

  function requireLogin(action: () => void) {
    if (!user) {
      setAuthMode("login");
      toast.error("Please login or signup to continue.");
      return;
    }
    action();
  }

  function openCompany(company: Company) {
    setSelected(company);
    setReviews([]);
    setReviewTotal(0);
    setReviewHasMore(false);
  }

  async function refreshCompanies() {
    await loadCompanies(1, true);
  }

  async function refreshSelectedReviews() {
    if (selected) await loadReviews(selected, 1, true);
  }

  async function likeReview(review: Review) {
    requireLogin(async () => {
      try {
        await reviewApi.like(selected!._id, review._id);
        await refreshSelectedReviews();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  }

  async function shareReview(review: Review) {
    try {
      await reviewApi.share(selected!._id, review._id);
      await navigator.clipboard?.writeText(window.location.href);
      toast.success("Review link copied.");
      await refreshSelectedReviews();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <main className="stage">
      <section className="app-shell">
        <Header
          user={user}
          search={search}
          onSearch={setSearch}
          onAuth={setAuthMode}
          onProfile={() => setProfileOpen(true)}
          onLogout={() => {
            localStorage.removeItem("review-rate-token");
            setUser(null);
            toast.success("Logged out.");
          }}
        />

        {!selected ? (
          <div className="list-page">
            <div className="filters">
              <label className="city-field">Select City<span><input value={city} onChange={(event) => setCity(event.target.value)} /><LocateFixed color="#8a13ff" size={19} /></span></label>
              <button className="gradient-button find-button" type="button" onClick={() => loadCompanies(1, true)}>Find Company</button>
              <button className="gradient-button add-company" type="button" onClick={() => requireLogin(() => setCompanyModal(true))}>+ Add Company</button>
              <label className="sort-field">Sort:<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="name">Name</option><option value="rating">Rating</option><option value="date">Date</option></select></label>
            </div>
            <div className="rule" />
            <div className="results">Result Found: {companyTotal}</div>
            <div className="company-list">
              {companies.map((company) => <CompanyCard key={company._id} company={company} onOpen={openCompany} />)}
              {!companiesLoading && companies.length === 0 && <div className="empty-state">No companies found.</div>}
              {companiesLoading && <div className="loading-state">Loading...</div>}
              <div ref={companySentinel} className="scroll-sentinel" />
            </div>
          </div>
        ) : (
          <div className="detail-page">
            <button type="button" className="back-link" onClick={() => setSelected(null)}>Back</button>
            <article className="detail-card">
              <div className="detail-head">
                <LogoMark company={selected} />
                <div className="company-main">
                  <h2>{selected.name}</h2>
                  <p><MapPin size={13} />{selected.location}</p>
                  {selected.description && <p className="company-description">{selected.description}</p>}
                  <div className="rating-line"><b>{selected.averageRating.toFixed(1)}</b><Stars value={selected.averageRating} /><b className="reviews-count">{selected.reviewCount} Reviews</b></div>
                </div>
                <div className="company-side detail-side">
                  <span>Founded on {format(new Date(selected.foundedOn), "dd-MM-yyyy")}</span>
                  <button className="gradient-button" type="button" onClick={() => requireLogin(() => setReviewModal(true))}>+ Add Review</button>
                </div>
              </div>
              <div className="review-toolbar">
                <span>Result Found: {reviewTotal}</span>
                <select value={reviewSortValue} onChange={(event) => setReviewSortValue(event.target.value)}>
                  <option value="date">Date</option>
                  <option value="rating">Rating</option>
                  <option value="relevance">Relevance</option>
                </select>
              </div>
              <div className="reviews">
                {reviews.map((review) => {
                  const reviewUser = typeof review.user === "string" ? null : review.user;
                  return (
                    <article className="review-row" key={review._id}>
                      <div className="review-avatar">
                        {reviewUser?.avatarUrl ? <img src={reviewUser.avatarUrl} alt="" /> : <span>{nameInitials(review.fullName)}</span>}
                      </div>
                      <div>
                        <h3>{review.fullName}</h3>
                        <time>{format(new Date(review.createdAt), "dd-MM-yyyy, HH:mm")}</time>
                        <p>{review.text}</p>
                        <div className="review-actions">
                          <button type="button" onClick={() => likeReview(review)}><Heart size={15} /> {review.likedBy.length}</button>
                          <button type="button" onClick={() => shareReview(review)}><Share2 size={15} /> {review.shareCount}</button>
                        </div>
                      </div>
                      <Stars value={review.rating} />
                    </article>
                  );
                })}
                {!reviewsLoading && reviews.length === 0 && <div className="empty-state">No reviews found.</div>}
                {reviewsLoading && <div className="loading-state">Loading...</div>}
                <div ref={reviewSentinel} className="scroll-sentinel" />
              </div>
            </article>
          </div>
        )}
      </section>

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onDone={(nextUser, token) => {
            localStorage.setItem("review-rate-token", token);
            setUser(nextUser);
          }}
        />
      )}
      {companyModal && <CompanyModal onClose={() => setCompanyModal(false)} onCreated={refreshCompanies} />}
      {selected && user && reviewModal && <ReviewModal company={selected} user={user} onClose={() => setReviewModal(false)} onSaved={refreshSelectedReviews} />}
      {user && profileOpen && <ProfileModal user={user} onClose={() => setProfileOpen(false)} onSaved={setUser} />}
    </main>
  );
}
