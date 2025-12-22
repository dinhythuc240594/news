--
-- PostgreSQL database dump
--

\restrict dUybFtauBpxmrm2nNEMo8r1cmlYp9EHHe1lrDNKcdTq4fBDaDeoM2vURKqLRHse

-- Dumped from database version 17.7
-- Dumped by pg_dump version 17.7

-- Started on 2025-12-22 21:32:26

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 893 (class 1247 OID 16900)
-- Name: news_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.news_status AS ENUM (
    'draft',
    'pending',
    'published',
    'hidden',
    'rejected'
);


ALTER TYPE public.news_status OWNER TO postgres;

--
-- TOC entry 899 (class 1247 OID 16920)
-- Name: newsstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.newsstatus AS ENUM (
    'DRAFT',
    'PENDING',
    'PUBLISHED',
    'HIDDEN',
    'REJECTED'
);


ALTER TYPE public.newsstatus OWNER TO postgres;

--
-- TOC entry 890 (class 1247 OID 16892)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'editor',
    'user'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- TOC entry 896 (class 1247 OID 16912)
-- Name: userrole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.userrole AS ENUM (
    'ADMIN',
    'EDITOR',
    'USER'
);


ALTER TYPE public.userrole OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 16784)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    icon character varying(50),
    order_display integer DEFAULT 0,
    parent_id integer,
    visible boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    level integer DEFAULT 1
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16783)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- TOC entry 5162 (class 0 OID 0)
-- Dependencies: 217
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 240 (class 1259 OID 17061)
-- Name: categories_international; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories_international (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    icon character varying(50),
    order_display integer DEFAULT 0,
    parent_id integer,
    visible boolean DEFAULT true,
    level integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.categories_international OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 17060)
-- Name: categories_international_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_international_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_international_id_seq OWNER TO postgres;

--
-- TOC entry 5163 (class 0 OID 0)
-- Dependencies: 239
-- Name: categories_international_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_international_id_seq OWNED BY public.categories_international.id;


--
-- TOC entry 232 (class 1259 OID 16966)
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    user_id integer NOT NULL,
    news_id integer NOT NULL,
    content text NOT NULL,
    parent_id integer,
    is_active boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    site character varying(10) DEFAULT 'vn'::character varying
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16965)
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO postgres;

--
-- TOC entry 5164 (class 0 OID 0)
-- Dependencies: 231
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- TOC entry 236 (class 1259 OID 17011)
-- Name: menu_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_items (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    icon character varying(50),
    order_display integer,
    parent_id integer,
    visible boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.menu_items OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 17010)
-- Name: menu_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_items_id_seq OWNER TO postgres;

--
-- TOC entry 5165 (class 0 OID 0)
-- Dependencies: 235
-- Name: menu_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_items_id_seq OWNED BY public.menu_items.id;


--
-- TOC entry 222 (class 1259 OID 16823)
-- Name: news; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.news (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    summary text,
    content text NOT NULL,
    thumbnail character varying(255),
    images text,
    category_id integer NOT NULL,
    created_by integer NOT NULL,
    approved_by integer,
    status character varying(20) DEFAULT 'draft'::character varying,
    is_featured boolean DEFAULT false,
    is_hot boolean DEFAULT false,
    view_count integer DEFAULT 0,
    meta_title character varying(255),
    meta_description text,
    meta_keywords character varying(255),
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_api boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    tags_string text,
    author character varying(255) DEFAULT NULL::character varying
);


ALTER TABLE public.news OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16997)
-- Name: news_api; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.news_api (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255),
    summary text,
    content text,
    thumbnail character varying(255),
    source character varying(100),
    source_url character varying(500),
    external_id character varying(100),
    category_name character varying(100),
    author character varying(100),
    published_at timestamp without time zone,
    fetched_at timestamp without time zone,
    is_processed boolean,
    processed_at timestamp without time zone,
    news_id integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.news_api OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16996)
-- Name: news_api_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.news_api_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.news_api_id_seq OWNER TO postgres;

--
-- TOC entry 5166 (class 0 OID 0)
-- Dependencies: 233
-- Name: news_api_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.news_api_id_seq OWNED BY public.news_api.id;


--
-- TOC entry 221 (class 1259 OID 16822)
-- Name: news_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.news_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.news_id_seq OWNER TO postgres;

--
-- TOC entry 5167 (class 0 OID 0)
-- Dependencies: 221
-- Name: news_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.news_id_seq OWNED BY public.news.id;


--
-- TOC entry 238 (class 1259 OID 17027)
-- Name: news_international; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.news_international (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    summary text,
    content text NOT NULL,
    thumbnail character varying(255),
    images text,
    category_id integer NOT NULL,
    created_by integer NOT NULL,
    approved_by integer,
    status character varying(20) DEFAULT 'draft'::character varying,
    is_featured boolean DEFAULT false,
    is_hot boolean DEFAULT false,
    view_count integer DEFAULT 0,
    meta_title character varying(255),
    meta_description text,
    meta_keywords character varying(255),
    language character varying(20) DEFAULT 'english'::character varying,
    source character varying(255),
    source_url character varying(255),
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_api boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    tags_string text
);


ALTER TABLE public.news_international OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 17026)
-- Name: news_international_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.news_international_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.news_international_id_seq OWNER TO postgres;

--
-- TOC entry 5168 (class 0 OID 0)
-- Dependencies: 237
-- Name: news_international_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.news_international_id_seq OWNED BY public.news_international.id;


--
-- TOC entry 226 (class 1259 OID 16867)
-- Name: news_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.news_tags (
    id integer NOT NULL,
    news_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.news_tags OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16866)
-- Name: news_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.news_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.news_tags_id_seq OWNER TO postgres;

--
-- TOC entry 5169 (class 0 OID 0)
-- Dependencies: 225
-- Name: news_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.news_tags_id_seq OWNED BY public.news_tags.id;


--
-- TOC entry 242 (class 1259 OID 17098)
-- Name: newsletter_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.newsletter_subscriptions (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    is_active boolean DEFAULT true,
    unsubscribe_token character varying(255) NOT NULL,
    subscribed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at timestamp without time zone,
    user_id integer
);


ALTER TABLE public.newsletter_subscriptions OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 17097)
-- Name: newsletter_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.newsletter_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.newsletter_subscriptions_id_seq OWNER TO postgres;

--
-- TOC entry 5170 (class 0 OID 0)
-- Dependencies: 241
-- Name: newsletter_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.newsletter_subscriptions_id_seq OWNED BY public.newsletter_subscriptions.id;


--
-- TOC entry 244 (class 1259 OID 17119)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 17118)
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 5171 (class 0 OID 0)
-- Dependencies: 243
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- TOC entry 228 (class 1259 OID 16932)
-- Name: saved_news; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saved_news (
    id integer NOT NULL,
    user_id integer NOT NULL,
    news_id integer NOT NULL,
    created_at timestamp without time zone,
    site character varying(10) DEFAULT 'vn'::character varying
);


ALTER TABLE public.saved_news OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16931)
-- Name: saved_news_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.saved_news_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saved_news_id_seq OWNER TO postgres;

--
-- TOC entry 5172 (class 0 OID 0)
-- Dependencies: 227
-- Name: saved_news_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.saved_news_id_seq OWNED BY public.saved_news.id;


--
-- TOC entry 246 (class 1259 OID 17138)
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    description text,
    category character varying(50),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 17137)
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_seq OWNER TO postgres;

--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 245
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- TOC entry 224 (class 1259 OID 16855)
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    slug character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16854)
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO postgres;

--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 223
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- TOC entry 220 (class 1259 OID 16806)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(100),
    role character varying(20) DEFAULT 'user'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    phone character varying(20),
    avatar character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16805)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 230 (class 1259 OID 16949)
-- Name: viewed_news; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.viewed_news (
    id integer NOT NULL,
    user_id integer NOT NULL,
    news_id integer NOT NULL,
    viewed_at timestamp without time zone,
    site character varying(10) DEFAULT 'vn'::character varying
);


ALTER TABLE public.viewed_news OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16948)
-- Name: viewed_news_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.viewed_news_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.viewed_news_id_seq OWNER TO postgres;

--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 229
-- Name: viewed_news_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.viewed_news_id_seq OWNED BY public.viewed_news.id;


--
-- TOC entry 4824 (class 2604 OID 16787)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 4866 (class 2604 OID 17064)
-- Name: categories_international id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories_international ALTER COLUMN id SET DEFAULT nextval('public.categories_international_id_seq'::regclass);


--
-- TOC entry 4852 (class 2604 OID 16969)
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- TOC entry 4855 (class 2604 OID 17014)
-- Name: menu_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items ALTER COLUMN id SET DEFAULT nextval('public.menu_items_id_seq'::regclass);


--
-- TOC entry 4835 (class 2604 OID 16826)
-- Name: news id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news ALTER COLUMN id SET DEFAULT nextval('public.news_id_seq'::regclass);


--
-- TOC entry 4854 (class 2604 OID 17000)
-- Name: news_api id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_api ALTER COLUMN id SET DEFAULT nextval('public.news_api_id_seq'::regclass);


--
-- TOC entry 4856 (class 2604 OID 17030)
-- Name: news_international id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_international ALTER COLUMN id SET DEFAULT nextval('public.news_international_id_seq'::regclass);


--
-- TOC entry 4847 (class 2604 OID 16870)
-- Name: news_tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_tags ALTER COLUMN id SET DEFAULT nextval('public.news_tags_id_seq'::regclass);


--
-- TOC entry 4872 (class 2604 OID 17101)
-- Name: newsletter_subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.newsletter_subscriptions_id_seq'::regclass);


--
-- TOC entry 4875 (class 2604 OID 17122)
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- TOC entry 4848 (class 2604 OID 16935)
-- Name: saved_news id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_news ALTER COLUMN id SET DEFAULT nextval('public.saved_news_id_seq'::regclass);


--
-- TOC entry 4878 (class 2604 OID 17141)
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- TOC entry 4845 (class 2604 OID 16858)
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- TOC entry 4830 (class 2604 OID 16809)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4850 (class 2604 OID 16952)
-- Name: viewed_news id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.viewed_news ALTER COLUMN id SET DEFAULT nextval('public.viewed_news_id_seq'::regclass);


--
-- TOC entry 5128 (class 0 OID 16784)
-- Dependencies: 218
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.categories VALUES (15, 'Thời Sự', 'thoi-su', NULL, NULL, 1, NULL, true, '2025-12-17 13:24:54.301507', '2025-12-17 13:24:54.301548', 1);
INSERT INTO public.categories VALUES (16, 'Việt Nam', 'viet-nam', NULL, NULL, 1, 15, true, '2025-12-17 13:25:39.194329', '2025-12-17 13:25:39.19439', 2);
INSERT INTO public.categories VALUES (14, 'Đông Nam Bộ', 'dong-nam-bo', NULL, NULL, 1, 11, true, '2025-12-14 15:30:55.971775', '2025-12-14 15:30:55.971802', 3);
INSERT INTO public.categories VALUES (1, 'Công nghệ', 'cong-nghe', 'Tin tức về công nghệ, phần mềm, ứng dụng', 'tech', 1, NULL, true, '2025-12-13 17:33:36.42487', '2025-12-14 15:35:03.194365', 1);
INSERT INTO public.categories VALUES (2, 'Kinh tế', 'kinh-te', 'Tin tức kinh tế, tài chính, đầu tư', 'economy', 2, NULL, true, '2025-12-13 17:33:36.42487', '2025-12-14 15:35:03.219305', 1);
INSERT INTO public.categories VALUES (3, 'Thể thao', 'the-thao', 'Tin tức thể thao trong nước và quốc tế', 'sports', 4, NULL, true, '2025-12-13 17:33:36.42487', '2025-12-14 15:35:03.260879', 1);
INSERT INTO public.categories VALUES (4, 'Giải trí', 'giai-tri', 'Tin tức giải trí, phim ảnh, ca nhạc', 'entertainment', 3, NULL, true, '2025-12-13 17:33:36.42487', '2025-12-14 15:35:03.248071', 1);
INSERT INTO public.categories VALUES (5, 'Giáo dục', 'giao-duc', 'Tin tức giáo dục, đào tạo', 'education', 6, NULL, true, '2025-12-13 17:33:36.42487', '2025-12-14 15:35:03.296838', 1);
INSERT INTO public.categories VALUES (6, 'Sức khỏe', 'suc-khoe', 'Tin tức về sức khỏe, y tế', 'health', 5, NULL, true, '2025-12-13 17:33:36.42487', '2025-12-14 15:35:03.289043', 1);
INSERT INTO public.categories VALUES (8, 'Máy tính', 'may-tinh', 'Tin tức về máy tính, laptop', 'laptop', 2, 1, true, '2025-12-13 17:33:36.42487', '2025-12-14 15:35:03.21062', 2);
INSERT INTO public.categories VALUES (9, 'Bóng đá', 'bong-da', 'Tin tức bóng đá', 'football', 1, 3, true, '2025-12-13 17:33:36.42487', '2025-12-14 15:35:03.27049', 2);
INSERT INTO public.categories VALUES (10, 'Bóng rổ', 'bong-ro', 'Tin tức bóng rổ', 'basketball', 2, 3, true, '2025-12-13 17:33:36.42487', '2025-12-14 15:35:03.279911', 2);
INSERT INTO public.categories VALUES (11, 'Trong Nước', 'trong-nuoc', NULL, NULL, 1, 2, true, '2025-12-14 14:43:18.422417', '2025-12-14 15:35:03.228087', 2);
INSERT INTO public.categories VALUES (12, 'Quốc Tế', 'quoc-te', NULL, NULL, 2, 2, true, '2025-12-14 14:43:34.735706', '2025-12-14 15:35:03.238146', 2);
INSERT INTO public.categories VALUES (7, 'Điện thoại', 'dien-thoai', 'Tin tức về điện thoại, smartphone', 'phone', 1, 1, true, '2025-12-13 17:33:36.42487', '2025-12-14 15:52:52.72584', 2);


--
-- TOC entry 5150 (class 0 OID 17061)
-- Dependencies: 240
-- Data for Name: categories_international; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.categories_international VALUES (1, 'Technology', 'technology', NULL, 'phone', 3, NULL, true, 1, '2025-12-16 15:23:14.809934', '2025-12-16 15:52:15.142965');
INSERT INTO public.categories_international VALUES (2, 'Economy', 'economy', NULL, 'economy', 1, NULL, true, 1, '2025-12-16 15:23:14.840912', '2025-12-16 15:52:15.045952');
INSERT INTO public.categories_international VALUES (3, 'Sports', 'sports', NULL, 'sports', 2, NULL, true, 1, '2025-12-16 15:23:14.85339', '2025-12-16 15:52:15.130246');
INSERT INTO public.categories_international VALUES (4, 'Entertainment', 'entertainment', NULL, 'entertainment', 4, NULL, true, 1, '2025-12-16 15:23:14.864696', '2025-12-16 15:52:15.154361');
INSERT INTO public.categories_international VALUES (5, 'Education', 'education', NULL, 'education', 5, NULL, true, 1, '2025-12-16 15:23:14.874815', '2025-12-16 15:52:15.165878');
INSERT INTO public.categories_international VALUES (7, 'Asia', 'asia', NULL, NULL, 1, 2, true, 2, '2025-12-16 15:51:13.819136', '2025-12-16 15:52:15.06532');
INSERT INTO public.categories_international VALUES (8, 'Africa', 'africa', NULL, NULL, 3, 2, true, 2, '2025-12-16 15:51:31.253753', '2025-12-16 15:52:15.117907');
INSERT INTO public.categories_international VALUES (9, 'Europe', 'europe', NULL, NULL, 2, 2, true, 2, '2025-12-16 15:52:05.902643', '2025-12-16 15:52:15.095688');
INSERT INTO public.categories_international VALUES (6, 'Health', 'health', NULL, 'health', 6, NULL, true, 1, '2025-12-16 15:23:14.887267', '2025-12-19 13:42:14.582694');


--
-- TOC entry 5142 (class 0 OID 16966)
-- Dependencies: 232
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.comments VALUES (1, 6, 3, 'Chúc mừng đội tuyển Việt Nam', NULL, true, '2025-12-14 03:17:34.150749', '2025-12-14 03:17:34.150762', 'vn');
INSERT INTO public.comments VALUES (2, 6, 2, 'Thị trường rất biến động, mọi người chú ý', NULL, true, '2025-12-14 03:19:20.732393', '2025-12-14 03:19:20.73242', 'vn');
INSERT INTO public.comments VALUES (3, 6, 2, 'Mọi người nên cần quan sát thị trường thêm', NULL, true, '2025-12-14 03:22:21.503276', '2025-12-14 03:22:21.503303', 'vn');
INSERT INTO public.comments VALUES (4, 6, 7, 'Điện thoại đẹp', NULL, true, '2025-12-21 15:17:07.325265', '2025-12-21 15:17:07.325293', 'vn');
INSERT INTO public.comments VALUES (5, 6, 7, 'Tôi đã mua hôm thứ 3', NULL, true, '2025-12-21 15:17:25.424445', '2025-12-21 15:17:25.42446', 'vn');
INSERT INTO public.comments VALUES (6, 6, 7, 'aaaa', NULL, true, '2025-12-21 15:46:45.763924', '2025-12-21 15:46:45.76396', 'vn');
INSERT INTO public.comments VALUES (7, 6, 7, 'bbbb', NULL, true, '2025-12-21 15:58:47.844577', '2025-12-21 15:58:47.844606', 'vn');
INSERT INTO public.comments VALUES (8, 6, 10, 'Ca sĩ tốt', NULL, true, '2025-12-21 16:01:11.210827', '2025-12-21 16:01:11.210855', 'vn');
INSERT INTO public.comments VALUES (9, 6, 3, 'Qúa hay', NULL, true, '2025-12-22 13:14:58.149855', '2025-12-22 13:14:58.149888', 'vn');
INSERT INTO public.comments VALUES (10, 6, 10, 'Good', NULL, true, '2025-12-22 13:35:17.646646', '2025-12-22 13:35:17.646676', 'en');
INSERT INTO public.comments VALUES (11, 6, 10, 'Very good', NULL, true, '2025-12-22 13:35:23.846762', '2025-12-22 13:35:23.846791', 'en');
INSERT INTO public.comments VALUES (12, 6, 6, 'Good', NULL, true, '2025-12-22 14:09:23.096033', '2025-12-22 14:09:23.096041', 'en');
INSERT INTO public.comments VALUES (13, 6, 5, 'Good', NULL, true, '2025-12-22 14:09:34.915264', '2025-12-22 14:09:34.915289', 'en');


--
-- TOC entry 5146 (class 0 OID 17011)
-- Dependencies: 236
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.menu_items VALUES (2, 'Kinh tế', 'kinh-te', 'economy', 2, NULL, true, NULL, NULL);
INSERT INTO public.menu_items VALUES (3, 'Thể thao', 'the-thao', 'sports', 3, NULL, true, NULL, NULL);
INSERT INTO public.menu_items VALUES (4, 'Giải trí', 'giai-tri', 'entertainment', 4, NULL, true, NULL, NULL);
INSERT INTO public.menu_items VALUES (5, 'Giáo dục', 'giao-duc', 'education', 5, NULL, true, NULL, NULL);
INSERT INTO public.menu_items VALUES (6, 'Sức khỏe', 'suc-khoe', 'health', 6, NULL, true, NULL, NULL);
INSERT INTO public.menu_items VALUES (7, 'Điện thoại', 'dien-thoai', 'phone', 1, 1, true, NULL, NULL);
INSERT INTO public.menu_items VALUES (8, 'Máy tính', 'may-tinh', 'laptop', 2, 1, true, NULL, NULL);
INSERT INTO public.menu_items VALUES (9, 'Bóng đá', 'bong-da', 'football', 1, 3, true, NULL, NULL);
INSERT INTO public.menu_items VALUES (10, 'Bóng rổ', 'bong-ro', 'basketball', 2, 3, true, NULL, NULL);
INSERT INTO public.menu_items VALUES (1, 'Công nghệ', 'cong-nghe', 'tech', 3, NULL, true, NULL, '2025-12-14 06:21:44.328219');


--
-- TOC entry 5132 (class 0 OID 16823)
-- Dependencies: 222
-- Data for Name: news; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.news VALUES (5, 'Chính phủ công bố chương trình hỗ trợ sinh viên mới', 'chinh-phu-cong-bo-chuong-trinh-ho-tro-sinh-vien-moi', 'Chính phủ vừa công bố gói hỗ trợ 500 tỷ đồng cho sinh viên có hoàn cảnh khó khăn.', 'Chương trình hỗ trợ mới sẽ cung cấp học bổng và hỗ trợ chi phí sinh hoạt cho sinh viên có hoàn cảnh khó khăn. Tổng giá trị gói hỗ trợ lên đến 500 tỷ đồng, dự kiến sẽ giúp đỡ hơn 50,000 sinh viên trên cả nước. Đơn đăng ký sẽ được mở từ tháng 2/2024.', NULL, NULL, 5, 2, 1, 'published', false, false, 650, 'Chương trình hỗ trợ sinh viên 500 tỷ đồng', 'Chính phủ công bố gói hỗ trợ 500 tỷ đồng cho sinh viên khó khăn', 'hỗ trợ sinh viên, học bổng, giáo dục', '2024-01-19 11:00:00', '2025-12-13 17:33:36.42487', '2025-12-13 17:33:36.42487', false, false, NULL, NULL);
INSERT INTO public.news VALUES (6, 'Nghiên cứu mới về tác dụng của trà xanh đối với sức khỏe', 'nghien-cuu-moi-ve-tac-dung-cua-tra-xanh-doi-voi-suc-khoe', 'Các nhà khoa học phát hiện trà xanh có thể giúp giảm nguy cơ mắc bệnh tim mạch.', 'Nghiên cứu mới được công bố trên tạp chí y khoa quốc tế cho thấy uống 3-4 tách trà xanh mỗi ngày có thể giảm 20% nguy cơ mắc bệnh tim mạch. Trà xanh chứa nhiều chất chống oxy hóa, đặc biệt là EGCG, có tác dụng bảo vệ tim mạch và cải thiện sức khỏe tổng thể.', NULL, NULL, 6, 2, 1, 'published', false, false, 420, 'Trà xanh giúp giảm nguy cơ bệnh tim mạch', 'Nghiên cứu cho thấy trà xanh có tác dụng tích cực đối với sức khỏe tim mạch', 'trà xanh, sức khỏe, tim mạch, dinh dưỡng', '2024-01-20 08:00:00', '2025-12-13 17:33:36.42487', '2025-12-13 17:33:36.42487', false, false, NULL, NULL);
INSERT INTO public.news VALUES (8, 'Laptop gaming mới với card đồ họa RTX 4090', 'laptop-gaming-moi-voi-card-do-hoa-rtx-4090', 'Các hãng laptop gaming hàng đầu ra mắt dòng sản phẩm mới với card đồ họa RTX 4090 mạnh mẽ.', 'Nhiều hãng laptop gaming như ASUS, MSI, và Razer đã ra mắt các mẫu laptop mới trang bị card đồ họa RTX 4090. Đây là card đồ họa mạnh nhất hiện tại, cho phép chơi game 4K mượt mà và render video nhanh chóng. Giá bán từ 50-80 triệu đồng tùy cấu hình.', NULL, NULL, 8, 2, 1, 'published', false, false, 750, 'Laptop gaming RTX 4090 ra mắt', 'Các hãng laptop gaming ra mắt sản phẩm mới với RTX 4090', 'laptop gaming, RTX 4090, ASUS, MSI', '2024-01-22 10:00:00', '2025-12-13 17:33:36.42487', '2025-12-13 17:33:36.42487', false, false, NULL, NULL);
INSERT INTO public.news VALUES (9, 'Giải bóng rổ chuyên nghiệp Việt Nam khởi tranh', 'giai-bong-ro-chuyen-nghiep-viet-nam-khoi-tranh', 'VBA 2024 chính thức khởi tranh với sự tham gia của 8 đội bóng trên cả nước.', 'Giải bóng rổ chuyên nghiệp Việt Nam (VBA) mùa giải 2024 đã chính thức khởi tranh. 8 đội bóng sẽ thi đấu vòng tròn để tìm ra nhà vô địch. Nhiều cầu thủ ngoại binh chất lượng cao được các đội tuyển mời về, hứa hẹn một mùa giải hấp dẫn.', NULL, NULL, 10, 3, 1, 'published', false, false, 581, 'VBA 2024 chính thức khởi tranh', 'Giải bóng rổ chuyên nghiệp Việt Nam mùa giải 2024 bắt đầu', 'bóng rổ, VBA, thể thao', '2024-01-23 19:00:00', '2025-12-13 17:33:36.42487', '2025-12-13 11:14:23.668677', false, false, NULL, NULL);
INSERT INTO public.news VALUES (3, 'Đội tuyển Việt Nam giành chiến thắng 3-1 trước Thái Lan', 'doi-tuyen-viet-nam-gianh-chien-thang-3-1-truoc-thai-lan', 'Đội tuyển bóng đá Việt Nam đã có chiến thắng thuyết phục 3-1 trước Thái Lan tại vòng loại World Cup.', 'Trong trận đấu diễn ra tối nay, đội tuyển Việt Nam đã thể hiện phong độ xuất sắc với chiến thắng 3-1 trước đối thủ Thái Lan. Các bàn thắng được ghi bởi Nguyễn Văn Toàn, Phạm Đức Huy và Nguyễn Quang Hải. Chiến thắng này giúp Việt Nam tăng cơ hội đi tiếp tại vòng loại World Cup.', NULL, NULL, 9, 3, 1, 'published', true, true, 2180, 'Việt Nam thắng Thái Lan 3-1 tại vòng loại World Cup', 'Đội tuyển Việt Nam giành chiến thắng thuyết phục trước Thái Lan', 'bóng đá, Việt Nam, Thái Lan, World Cup', '2024-01-17 20:00:00', '2025-12-13 17:33:36.42487', '2025-12-22 13:14:45.195906', false, false, NULL, NULL);
INSERT INTO public.news VALUES (4, 'Phim "Mai" của đạo diễn Trấn Thành đạt doanh thu kỷ lục', 'phim-mai-cua-dao-dien-tran-thanh-dat-doanh-thu-ky-luc', 'Bộ phim "Mai" đã cán mốc 200 tỷ đồng doanh thu, trở thành phim Việt Nam có doanh thu cao nhất mọi thời đại.', 'Phim "Mai" của đạo diễn Trấn Thành tiếp tục gây sốt phòng vé với doanh thu vượt mốc 200 tỷ đồng. Bộ phim kể về câu chuyện cảm động của một người phụ nữ tên Mai, đã chạm đến trái tim của hàng triệu khán giả. Đây là thành tích đáng tự hào của điện ảnh Việt Nam.', NULL, NULL, 4, 3, 1, 'published', false, true, 1853, 'Phim "Mai" đạt doanh thu 200 tỷ đồng', 'Phim "Mai" của Trấn Thành trở thành phim Việt Nam có doanh thu cao nhất', 'phim Mai, Trấn Thành, điện ảnh Việt Nam', '2024-01-18 09:00:00', '2025-12-13 17:33:36.42487', '2025-12-13 15:34:00.294948', false, false, NULL, NULL);
INSERT INTO public.news VALUES (7, 'Samsung Galaxy S24 Ultra với AI tích hợp sẵn', 'samsung-galaxy-s24-ultra-voi-ai-tich-hop-san', 'Samsung ra mắt Galaxy S24 Ultra với nhiều tính năng AI thông minh, hỗ trợ dịch thuật và chỉnh sửa ảnh.', 'Galaxy S24 Ultra là flagship mới nhất của Samsung với chip Snapdragon 8 Gen 3 và nhiều tính năng AI tích hợp. Điện thoại có khả năng dịch cuộc gọi real-time, chỉnh sửa ảnh bằng AI, và tối ưu hóa hiệu năng thông minh. Camera 200MP cho chất lượng ảnh chuyên nghiệp.', NULL, NULL, 7, 3, 1, 'published', true, false, 1000, 'Samsung Galaxy S24 Ultra - AI tích hợp', 'Galaxy S24 Ultra với chip Snapdragon 8 Gen 3 và tính năng AI thông minh', 'Samsung, Galaxy S24, AI, smartphone', '2024-01-21 15:00:00', '2025-12-13 17:33:36.42487', '2025-12-21 15:58:34.948642', false, false, NULL, NULL);
INSERT INTO public.news VALUES (2, 'Thị trường chứng khoán tăng điểm mạnh trong phiên giao dịch hôm nay', 'thi-truong-chung-khoan-tang-diem-manh-trong-phien-giao-dich-hom-nay', 'VN-Index tăng hơn 20 điểm trong phiên giao dịch hôm nay, đạt mức cao nhất trong 3 tháng qua.', 'Thị trường chứng khoán Việt Nam ghi nhận phiên giao dịch tích cực với VN-Index tăng 20.5 điểm, đạt mức 1,245 điểm. Các cổ phiếu ngân hàng và bất động sản dẫn đầu đà tăng. Chuyên gia nhận định xu hướng tích cực sẽ tiếp tục trong các phiên tới.', NULL, NULL, 2, 2, 1, 'published', false, false, 894, 'Thị trường chứng khoán tăng điểm mạnh', 'VN-Index tăng 20.5 điểm, đạt mức cao nhất trong 3 tháng', 'chứng khoán, VN-Index, đầu tư, tài chính', '2024-01-16 14:30:00', '2025-12-13 17:33:36.42487', '2025-12-14 03:19:40.909188', false, false, NULL, NULL);
INSERT INTO public.news VALUES (12, 'Bản nháp bài viết', 'ban-nhap-bai-viet', 'Đây là một bản nháp bài viết chưa hoàn thiện.', 'Nội dung bài viết này đang được soạn thảo và chưa sẵn sàng để xuất bản. Tác giả đang tiếp tục chỉnh sửa và bổ sung thông tin.', NULL, NULL, 2, 4, NULL, 'draft', false, false, 0, NULL, NULL, NULL, NULL, '2025-12-13 17:33:36.42487', '2025-12-13 17:33:36.42487', false, false, NULL, NULL);
INSERT INTO public.news VALUES (10, 'Ca sĩ Sơn Tùng M-TP phát hành MV mới', 'ca-si-son-tung-mtp-phat-hanh-mv-moi', 'Sơn Tùng M-TP vừa ra mắt MV "Chúng ta của tương lai" với concept độc đáo.', 'MV mới của Sơn Tùng M-TP đã thu hút hàng triệu lượt xem chỉ sau vài giờ phát hành. MV có concept về tương lai với hình ảnh và âm thanh hiện đại. Đây là sản phẩm âm nhạc đầu tiên của nam ca sĩ trong năm 2024.', NULL, NULL, 4, 3, 1, 'published', false, true, 3202, 'Sơn Tùng M-TP ra mắt MV mới', 'MV "Chúng ta của tương lai" của Sơn Tùng M-TP thu hút triệu lượt xem', 'Sơn Tùng M-TP, MV, âm nhạc', '2024-01-24 20:00:00', '2025-12-13 17:33:36.42487', '2025-12-21 16:01:02.48182', false, false, NULL, NULL);
INSERT INTO public.news VALUES (11, 'Tin tức đang chờ duyệt', 'tin-tuc-dang-cho-duyet', 'Đây là một bài viết đang ở trạng thái chờ duyệt.', 'Nội dung bài viết này đang được biên tập viên xem xét và chờ phê duyệt từ quản trị viên. Bài viết sẽ được xuất bản sau khi được duyệt.', NULL, NULL, 1, 2, 1, 'published', false, false, 0, NULL, NULL, NULL, '2025-12-22 13:13:11.255764', '2025-12-13 17:33:36.42487', '2025-12-22 13:13:11.267913', false, false, NULL, NULL);
INSERT INTO public.news VALUES (14, 'Chuyện gì đây: Một đại gia Việt mở 3 siêu thị mỗi ngày, triền miên suốt hơn 1 tháng vẫn chưa dừng lại', 'chuyen-gi-day-mot-dai-gia-viet-mo-3-sieu-thi-moi-ngay-trien-mien-suot-hon-1-thang-van-chua-dung-lai-pending', 'Từ đầu năm đến nay, đại gia bán lẻ này đã mở mới tổng cộng 759 siêu thị thực phẩm trên cả nước.', '<h2 class="sapo" data-role="sapo" style="-webkit-font-smoothing: antialiased; text-rendering: geometricprecision; margin-top: 20px; margin-bottom: 0px; font-family: Arial; font-size: 16px; line-height: 22px; font-weight: 700; color: rgb(51, 51, 51);"><img src="/static/uploads/news/vn/news_14/20251218_213330_avatar1765994216720-1765994217186524087848.webp" style="width: 640px;"><br></h2><h2 class="sapo" data-role="sapo" style="-webkit-font-smoothing: antialiased; text-rendering: geometricprecision; margin-top: 20px; margin-bottom: 0px; font-family: Arial; font-size: 16px; line-height: 22px; font-weight: 700; color: rgb(51, 51, 51);">Từ đầu năm đến nay, đại gia bán lẻ này đã mở mới tổng cộng 759 siêu thị thực phẩm trên cả nước.</h2><p style="-webkit-font-smoothing: antialiased; text-rendering: geometricprecision; margin-bottom: 15px; font-family: &quot;Times New Roman&quot;; font-size: 17px;">Theo cập nhật trên website bachhoaxanh.com, chuỗi siêu thị bán lẻ thực phẩm và hàng tiêu dùng Bách Hóa Xanh (BHX) hiện có đến 2.529 cửa hàng, con số kỷ lục kể từ khi hoạt động. Tính từ cuối tháng 10 đến nay, BHX đã mở thêm 159 cửa hàng sau khoảng 1 tháng rưỡi, tức là trung bình mỗi ngày mở mới 3 cửa hàng.</p><p style="-webkit-font-smoothing: antialiased; text-rendering: geometricprecision; margin-bottom: 15px; font-family: &quot;Times New Roman&quot;; font-size: 17px;">Luỹ kế từ đầu năm, BHX của "đại gia" bán lẻ Nguyễn Đức Tài đã mở mới tổng cộng 759 cửa hàng, vượt xa mục tiêu 600 cửa hàng đề ra hồi đầu năm. Các cửa hàng mở mới trong khoảng 2 tháng trở lại đây chủ yếu tại khu vực tỉnh Ninh Bình, Hưng Yên.</p><p style="-webkit-font-smoothing: antialiased; text-rendering: geometricprecision; margin-bottom: 15px; font-family: &quot;Times New Roman&quot;; font-size: 17px;"><img src="/static/uploads/news/vn/news_14/20251218_213419_screenshot-2025-12-18-at-003250-1765994217907-17659942181101389434001.png" style="width: 737.6px;"><br></p><p style="-webkit-font-smoothing: antialiased; text-rendering: geometricprecision; margin-bottom: 15px; font-family: &quot;Times New Roman&quot;; font-size: 17px;">Chia sẻ tại buổi họp nhà đầu tư mới đây, ông Vũ Đăng Linh - Tổng Giám đốc MWG cho biết, BHX chọn Ninh Bình làm bàn đạp để Bắc tiến bởi đây là thị trường gần với Thanh Hóa đã triển khai, thuận tiện cho các hoạt động phân phối. Tuy nhiên, Miền Bắc là thị trường mới, MWG sẽ mở rộng thận trọng thăm dò, sau đó sẽ đánh giá tính khả thi và thực hiện các công việc tiếp theo.</p><p style="-webkit-font-smoothing: antialiased; text-rendering: geometricprecision; margin-bottom: 15px; font-family: &quot;Times New Roman&quot;; font-size: 17px;">Ông Linh đánh giá hoạt động logistics ở miền Trung với dải đất dài là phức tạp hơn, song hiện tại đã triển khai được. Tổng Giám đốc MWG tự tin về hoạt động logistics ở miền Bắc sẽ không gặp vấn đề nghiêm trọng, nhất là khi có lợi thế về hệ thống chuỗi kinh doanh ở tất cả các vùng.</p><p style="-webkit-font-smoothing: antialiased; text-rendering: geometricprecision; margin-bottom: 15px; font-family: &quot;Times New Roman&quot;; font-size: 17px;"><br></p><p style="-webkit-font-smoothing: antialiased; text-rendering: geometricprecision; margin-bottom: 15px; font-family: &quot;Times New Roman&quot;; font-size: 17px;">Thời điểm đó, lãnh đạo MWG cho biết sẽ mở rộng thận trọng thăm dò do miền Bắc là thị trường mới, sau đó sẽ đánh giá tính khả thi và thực hiện các công việc tiếp theo. Tuy nhiên, tốc độ mở cửa hàng chóng mặt của BHX thời gian gần đây có thể là tín hiệu cho thấy doanh nghiệp bán lẻ này đã tìm đúng công thức để chiếm lĩnh thị phần tại miền Bắc.</p><p style="-webkit-font-smoothing: antialiased; text-rendering: geometricprecision; margin-bottom: 15px; font-family: &quot;Times New Roman&quot;; font-size: 17px;">Tổng Giám đốc MWG đánh giá, xu hướng đang chuyển dịch từ kênh truyền thống sang hiện đại, là cơ hội cho BHX mở mới và chiếm lĩnh thị phần lớn hơn thời gian tới. “Năm 2026, BHX chưa có kế hoạch cụ thể nhưng việc mở mới là đương nhiên, không dưới số cửa hàng đã mở năm 2025”, ông Linh cho biết con số 1.000 cửa hàng trong năm tới là khả thi nhưng sẽ xem xét lại cụ thể.</p><p style="-webkit-font-smoothing: antialiased; text-rendering: geometricprecision; margin-bottom: 15px; font-family: &quot;Times New Roman&quot;; font-size: 17px;">Trước đó, trong buổi họp nhà đầu tư quý 2, lãnh đạo MWG cho biết 2026 sẽ là bản lề để BHX hiện thực hoá tham vọng mở mới 1.000 cửa hàng mỗi năm, hướng đến mục tiêu 10 tỷ USD doanh thu trước 2030. Đây là mục tiêu không dễ dàng đạt được nhưng tốc độ mở mới cửa hàng như hiện nay vẫn mang đến không ít hy vọng cho nhà đầu tư.</p><p style="-webkit-font-smoothing: antialiased; text-rendering: geometricprecision; margin-bottom: 15px; font-family: &quot;Times New Roman&quot;; font-size: 17px;">Về kết quả kinh doanh, Tổng Giám đốc MWG cho biết, mặc dù doanh thu chưa đạt nhưng lợi nhuận BHX khá ổn, lãi khoảng 200 tỷ trong quý 3, đồng thời khẳng định lợi nhuận của BHX năm nay không dưới 600 tỷ đồng. Tính đến hết quý 3/2025, BHX vẫn còn lỗ lũy kế khoảng 6.900 tỷ đồng.</p><p style="-webkit-font-smoothing: antialiased; text-rendering: geometricprecision; margin-bottom: 15px; font-family: &quot;Times New Roman&quot;; font-size: 17px;">Trước lo ngại của nhà đầu tư về việc BHX không kịp xóa lỗ lũy kế để IPO vào năm 2028, ông Linh xác nhận IPO là mục tiêu nhưng thời điểm sẽ tính toán kỹ lưỡng. Tổng Giám đốc MWG nhấn mạnh điều kiện tiên quyết để niêm yết thì phải làm sao để xóa được toàn bộ phần lỗ lũy kế. Đây là một mục tiêu thách thức nhưng vẫn hoàn toàn khả thi.</p><p style="-webkit-font-smoothing: antialiased; text-rendering: geometricprecision; margin-bottom: 15px; font-family: &quot;Times New Roman&quot;; font-size: 17px;"><br></p><p class="author" style="-webkit-font-smoothing: antialiased; text-rendering: geometricprecision; text-align: right; font-weight: bold; font-size: 17px; font-family: &quot;Time New Roman&quot;; color: rgb(51, 51, 51); margin-bottom: 0px !important;">Hà Linh</p><p class="source" data-field="source" style="-webkit-font-smoothing: antialiased; text-rendering: geometricprecision; margin-top: 8px; margin-bottom: 0px; font-style: italic; text-align: right; width: 640px; color: rgb(51, 51, 51); font-family: Arial;">Nhịp Sống Thị Trường</p>', '/static/uploads/news/vn/news_14/20251218_213506_avatar1765994216720-1765994217186524087848.webp', '["/static/uploads/news/vn/news_14/20251218_213330_avatar1765994216720-1765994217186524087848.webp", "/static/uploads/news/vn/news_14/20251218_213419_screenshot-2025-12-18-at-003250-1765994217907-17659942181101389434001.png"]', 2, 2, 1, 'published', false, false, 4, NULL, NULL, NULL, '2025-12-18 14:51:33.299799', '2025-12-18 14:35:18.686082', '2025-12-22 14:27:10.101506', false, false, NULL, NULL);
INSERT INTO public.news VALUES (1, 'iPhone 15 Pro Max ra mắt với chip A17 Pro mạnh mẽ', 'iphone-15-pro-max-ra-mat-voi-chip-a17-pro-manh-me', 'Apple vừa chính thức ra mắt iPhone 15 Pro Max với chip A17 Pro mới nhất, mang lại hiệu năng vượt trội.', 'Apple đã chính thức ra mắt iPhone 15 Pro Max tại sự kiện đặc biệt. Chiếc smartphone mới được trang bị chip A17 Pro với hiệu năng mạnh mẽ hơn 20% so với thế hệ trước. Camera được nâng cấp với khả năng quay video 4K và chụp ảnh chuyên nghiệp. Pin có thời lượng sử dụng lên đến 2 ngày với sạc nhanh 30W.', NULL, NULL, 7, 2, 1, 'published', true, true, 1256, 'iPhone 15 Pro Max - Chip A17 Pro mạnh mẽ', 'iPhone 15 Pro Max với chip A17 Pro, camera nâng cấp và pin bền bỉ', 'iPhone 15, A17 Pro, Apple, smartphone', '2024-01-15 10:00:00', '2025-12-13 17:33:36.42487', '2025-12-14 02:24:32.19162', false, false, NULL, NULL);
INSERT INTO public.news VALUES (13, 'Tổng Bí thư yêu cầu xây dựng đề án tổng kết Hiến pháp 2013', 'tong-bi-thu-yeu-cau-xay-dung-de-an-tong-ket-hien-phap-2013-pending', 'Tổng Bí thư Tô Lâm giao Đảng ủy Quốc hội nghiên cứu bổ sung nhiệm vụ tổng kết việc thực hiện Hiến pháp năm 2013, bảo đảm đồng bộ với các tổng kết lớn của Đảng.', '<p class="description" style="margin-bottom: 15px; text-rendering: optimizelegibility; font-size: 18px; line-height: 28.8px; color: rgb(34, 34, 34); font-family: arial; background-color: rgb(252, 250, 246);">Tổng Bí thư Tô Lâm giao Đảng ủy Quốc hội nghiên cứu bổ sung nhiệm vụ tổng kết việc thực hiện Hiến pháp năm 2013, bảo đảm đồng bộ với các tổng kết lớn của Đảng.</p><article class="fck_detail " lg-uid="lg0" style="text-rendering: optimizelegibility; width: 680px; float: left; position: relative; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-language-override: normal; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 18px; line-height: 28.8px; font-family: arial; color: rgb(34, 34, 34); background-color: rgb(252, 250, 246);"><p class="Normal" style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;">Sáng 17/12, Tổng Bí thư Tô Lâm chủ trì phiên họp Ban Chỉ đạo Trung ương về hoàn thiện thể chế, pháp luật. Thủ tướng Phạm Minh Chính và Chủ tịch Quốc hội Trần Thanh Mẫn dự họp.</p><p class="Normal" style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;">Phát biểu tại phiên họp, Tổng Bí thư lưu ý việc đánh giá công tác năm 2025 và xác định nhiệm vụ năm 2026 phải quán triệt tinh thần "đã tốt rồi cần tốt hơn nữa". Bên cạnh các công việc thường xuyên, ông yêu cầu các cơ quan tập trung thực hiện ba nhiệm vụ trọng tâm gồm: thể chế hóa kịp thời các quan điểm, chủ trương lớn trong văn kiện Đại hội 14; sớm hoàn thành các luật, nghị quyết đã được Quốc hội khóa 15 thông qua tại kỳ họp 10 và văn bản hướng dẫn thi hành; tháo gỡ nhanh nhất các điểm nghẽn, vướng mắc pháp luật, không để cản trở phát triển.</p><p class="Normal" style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;">Tổng Bí thư cho biết Bộ Chính trị đã thống nhất chủ trương báo cáo Trung ương về việc tiến hành các đề án tổng kết lớn trong nhiệm kỳ Đại hội 14, gồm tổng kết 100 năm Đảng lãnh đạo cách mạng Việt Nam và tổng kết một số vấn đề lý luận, thực tiễn sau 40 năm thực hiện Cương lĩnh xây dựng đất nước trong thời kỳ quá độ lên chủ nghĩa xã hội năm 1991.</p><p class="Normal" style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;">Trên cơ sở đó, Tổng Bí thư đề nghị Đảng ủy Quốc hội nghiên cứu bổ sung nhiệm vụ tổng kết việc thực hiện Hiến pháp năm 2013, đề xuất các vấn đề liên quan, bảo đảm đồng bộ với những tổng kết lớn của Đảng.</p><p class="Normal" style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;"><img src="/static/uploads/news/vn/news_13/20251217_202714_dc6d83439e4b1115485a-176597004-3183-6154-1765970358.webp" style="width: 737.6px;"></p><p class="Normal" style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;"><span style="font-size: 14px;">Tổng Bí thư Tô Lâm phát biểu sáng 17/12. Ảnh:&nbsp;</span><em style="text-rendering: optimizelegibility; font-size: 14px;">TTXVN</em></p><p class="Normal" style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;">Đối với Đề án hoàn thiện cấu trúc hệ thống pháp luật Việt Nam đáp ứng yêu cầu phát triển đất nước trong kỷ nguyên mới, Tổng Bí thư nhấn mạnh Ban Chỉ đạo cơ bản thống nhất với đề xuất của cơ quan chủ trì soạn thảo đối với hai nội dung còn ý kiến khác nhau. Theo đó, văn bản quy phạm pháp luật cần giảm bớt theo nguyên tắc mỗi cơ quan chỉ ban hành một loại văn bản, hướng tới hệ thống pháp luật tinh gọn, minh bạch, dễ tiếp cận.</p><p class="Normal" style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;">Tổng Bí thư cũng yêu cầu đổi mới mạnh mẽ việc hợp nhất văn bản quy phạm pháp luật, theo hướng văn bản hợp nhất được ban hành đồng thời với văn bản sửa đổi, bổ sung, làm căn cứ chính thức trong viện dẫn và áp dụng pháp luật. Việc này nhằm tạo thuận lợi cho người dân, doanh nghiệp và cán bộ, công chức trong quá trình thực thi pháp luật, phù hợp chủ trương lấy người dân, doanh nghiệp làm trung tâm trong thiết kế chính sách.</p><p class="Normal" style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;">Đối với báo cáo về các chính sách lớn nhằm huy động, khơi thông nguồn lực tài chính cho phát triển kinh tế, Tổng Bí thư lưu ý cần ưu tiên giữ vững ổn định kinh tế vĩ mô, kiểm soát lạm phát; tăng cường phối hợp chặt chẽ giữa chính sách tài khóa và chính sách tiền tệ; phát triển đồng bộ thị trường trái phiếu chính phủ, thị trường vốn và thị trường tiền tệ.</p><p class="Normal" style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;">Cùng với đó, các cơ quan cần tháo gỡ triệt để các điểm nghẽn thể chế, cắt giảm thực chất thủ tục hành chính, điều kiện kinh doanh, giảm chi phí tuân thủ pháp luật, tạo môi trường đầu tư, kinh doanh thông thoáng cho mọi thành phần kinh tế. Tổng Bí thư cũng lưu ý việc xác định mô hình, cơ chế quản lý, sử dụng hiệu quả vốn nhà nước tại doanh nghiệp, đồng thời sớm triển khai các cơ chế, chính sách đặc thù đối với trung tâm tài chính quốc tế, khu thương mại tự do và tài sản mã hóa.</p><p class="Normal" style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;">Tổng Bí thư giao Ban Chính sách, Chiến lược Trung ương hoàn thiện dự thảo nghị quyết về các giải pháp chiến lược thúc đẩy tăng trưởng kinh tế hai con số gắn với xác lập mô hình tăng trưởng mới, trình Hội nghị Trung ương. Đảng ủy Bộ Tài chính được giao hoàn thiện thể chế hỗ trợ phát triển doanh nghiệp vừa và nhỏ theo hướng thực chất, hiệu quả, sớm tháo gỡ các điểm nghẽn về tiếp cận tín dụng, đào tạo, tư vấn và pháp lý.</p><p class="Normal" style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;">Tổng Bí thư nhấn mạnh việc làm tốt các nội dung trên sẽ góp phần tạo việc làm, sinh kế cho người lao động, hỗ trợ an sinh xã hội và củng cố niềm tin của doanh nghiệp vừa và nhỏ đối với các chính sách của Đảng, Nhà nước trong giai đoạn phát triển mới.</p><p class="Normal" style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;">Ban Nội chính Trung ương được giao nghiên cứu bổ sung, hoàn thiện tổng kết 20 năm thực hiện Nghị quyết Trung ương 3 khóa 10 về phòng, chống tham nhũng, lãng phí, tiêu cực, đồng thời xây dựng nghị quyết mới trình Trung ương xem xét, thông qua.</p><p class="Normal" style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px;"><em style="text-rendering: optimizelegibility; font-size: 14px;"></em></p><p class="Normal" style="margin-bottom: 1em; text-rendering: optimizespeed; line-height: 28.8px; text-align: right;"><strong style="text-rendering: optimizelegibility;">Vũ Tuân</strong></p></article>', '/static/uploads/news/vn/news_13/20251217_202648_dc6d83439e4b1115485a-176597004-3183-6154-1765970358.webp', '["/static/uploads/news/vn/news_13/20251217_202714_dc6d83439e4b1115485a-176597004-3183-6154-1765970358.webp"]', 15, 2, 1, 'published', false, false, 6, NULL, NULL, NULL, '2025-12-18 15:21:42.64896', '2025-12-17 13:28:01.587941', '2025-12-22 14:27:07.433307', false, false, NULL, NULL);
INSERT INTO public.news VALUES (17, 'Aa', 'aa-pending', 'aaaaa', '<p>aaaa</p>', '/static/uploads/news/vn/news_17/20251218_225120_383775830_282201141428017_7484135846809993505_n.jpg', NULL, 1, 2, 1, 'rejected', false, false, 0, NULL, NULL, NULL, NULL, '2025-12-18 15:51:23.123645', '2025-12-18 15:52:44.432407', false, false, NULL, NULL);
INSERT INTO public.news VALUES (16, 'Quảng cáo', 'quang-cao-pending', 'PROJECT XÂY DỰNG DATA PIPELINE UBER END-TO-END TRÊN GCP: TỪ RAW DATA ĐẾN DASHBOARD', '<p><img src="/static/uploads/news/vn/news_16/20251218_223050_image.png" style="width: 737.6px;"></p><div class="xdj266r x14z9mp xat24cr x1lziwak x1vvkbs x126k92a" style="overflow-wrap: break-word; white-space-collapse: preserve; margin-inline: 0px; font-family: &quot;Segoe UI Historic&quot;, &quot;Segoe UI&quot;, Helvetica, Arial, sans-serif; color: rgb(8, 8, 9); font-size: 15px;"><div dir="auto" style="font-family: inherit;">PROJECT XÂY DỰNG DATA PIPELINE UBER END-TO-END TRÊN GCP: TỪ RAW DATA ĐẾN DASHBOARD</div></div><div class="x14z9mp xat24cr x1lziwak x1vvkbs xtlvy1s x126k92a" style="overflow-wrap: break-word; white-space-collapse: preserve; margin-top: 0.5em; margin-inline: 0px; font-family: &quot;Segoe UI Historic&quot;, &quot;Segoe UI&quot;, Helvetica, Arial, sans-serif; color: rgb(8, 8, 9); font-size: 15px;"><div dir="auto" style="font-family: inherit;"><span class="html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs" style="text-align: inherit; overflow-wrap: break-word; margin-inline: 0px; padding-inline: 0px; font-family: inherit;"><a tabindex="-1" class="html-a xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs" style="color: rgb(56, 88, 152); cursor: pointer; text-decoration: none; text-align: inherit; overflow-wrap: break-word; margin-inline: 0px; padding-inline: 0px;"></a></span>Nếu bạn đang học Data Engineering và muốn có một project đủ “nặng đô” để đưa vào portfolio, thì đây là một case cần lưu ngay. </div></div><div class="x14z9mp xat24cr x1lziwak x1vvkbs xtlvy1s x126k92a" style="overflow-wrap: break-word; white-space-collapse: preserve; margin-top: 0.5em; margin-inline: 0px; font-family: &quot;Segoe UI Historic&quot;, &quot;Segoe UI&quot;, Helvetica, Arial, sans-serif; color: rgb(8, 8, 9); font-size: 15px;"><div dir="auto" style="font-family: inherit;">Mục tiêu của dự án này là thực hiện phân tích dữ liệu Uber bằng cách sử dụng nhiều công cụ và công nghệ khác nhau, bao gồm GCP Storage, Python, Compute Instance, Mage Data Pipeline Tool, BigQuery và Looker Studio.</div></div><div class="x14z9mp xat24cr x1lziwak x1vvkbs xtlvy1s x126k92a" style="overflow-wrap: break-word; white-space-collapse: preserve; margin-top: 0.5em; margin-inline: 0px; font-family: &quot;Segoe UI Historic&quot;, &quot;Segoe UI&quot;, Helvetica, Arial, sans-serif; color: rgb(8, 8, 9); font-size: 15px;"><div dir="auto" style="font-family: inherit;">Link Gifhub ở đây nhá: <span class="html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs" style="text-align: inherit; overflow-wrap: break-word; margin-inline: 0px; padding-inline: 0px; font-family: inherit;"><a attributionsrc="/privacy_sandbox/comet/register/source/?xt=AZbgR17KguGNc8HauDj2cq-Jyv-q5nu88gEinImrqQ_KHdxgDXO8aGkp2dlRKp-2pJjUDueJg4mj108RxwfBfpd4tTs4FQQkPVsNn3bk_fBlbUCZ6KbOfeoZOlMdPiqjX2FTu-Qf5J_17Btc1a1uPQ8_wlcG0INTB1ANAxJdqXf15326UVVHtzXUXM_rAkuTmXXe50X1wPIf8pf3ORKQZBfFsRxsIeekzB02HjxSiQNk9yN4akxTCafw2a0lUu1XnUauTC1hMGK1T38EaV0ba_650Bju2Y9MwrJRmYyjjFih-NF74-x9aicBvCKstjYVpVKmd_mBiMRyfI5HopjflexB8ItkOgLeOoPTwB8tR6Z2vqywhGc0Ek0SbwiLnPZRPubsRMRdotiVfJQZiSNabMo4EFi6IzgrFSgQDNF4PoRvmWR9NO39K3aVNwmsj6EdqAZGsC6lyyI1Mnn0Nhi5WxLGkU_JZwQCZHrJNv70wg0A_sRqiKhPWe-288Haay_Np6Z4bqPPwaq0y3v9MYwU4bOV_29MYTcMsRYUGMq0X9K4KC6BLAbEiZkkU4-0mDsImfEu21jtEYyCIXJ2A74jt_Y3M0IM93h2gWgar_B4skoSsYdU3lWQhb28ZKVFc-bNaaFi_7_7LMMKds8PkG3DDEsd2zMVzWgiDTv8e7kTKruxv9yNldeW6b4buoKOv2h_k3G7PxIarP-R2IQPhOpOmCi_dCKjdmgtzys_uJXOXP_TlmN9uw7HVba0PEAeoQq6XLiiTReD35ByecgpGouPE-a1sI1pYqwmgyAKg5LJBjQHDx6eTNr4BuLCIyhqu5qiX7xMox81eYO9DwCCbdavxYOKW_WRSQ2IKsRw-lfTDhGgv6eJ2UBckPheiz5p1mMLVb4mUGwJOJwhyqRV5cKiHLMiUdob2iXyz7XFRRpgI-ZYxoyW74Yqa8XLQEtTqLP2WEmKkC7L5FbIhxk6p_FZvEUTw6HJD1fQeYzI0CU1MIaPJaQJrQNtbhFy-LStEftIhkuKPFr3DkqhfS4x4edCIg80gwrRtwJ17vdxH4LhgOBWxOScRCXZ5k1CBFO1-fcGbggHNnC8NFlEAEBGn_IOVWUSmQq00Lx3hkerdtCpd2R3w7Bx60uFrFLhj2_6O9n71Ne4UCVC_lbogFWvnzcojMFrhNlv6bNKG8_XRhm08pBfoWGQ4usvRnymMFdJcX5yZGilg2SKycBaigurq67bgbDheeuef_djYwXFPcu164HeRpQF1B2J9Ebm-2sWZ2GiYnURdB96jAUHfTGSgxDh3_NEMOauLLNEZMqwdx7UYJxeDoBO4jccs3UVqn1geKmqQ_eKUQLp8tMmoz_8gx9JbiYoCr0mEFclqD1-TuVHs2d9Cp2I8CCEtxkfbJIYM8y3pqw9SmX5OZVryQFMuLknM5M4-22Nu25q15Ru3Ed_uCB4lKDjY2WzVny8Nrw6deuEtsmZbkeohA0NPDKheuGr3RPXhcOOvFy44vZS2I-9kdSKF4M64_2bLl0clRwXh-b2XgbgdaB8MJlF4dU7vSlEzbg9avC_t2_Zj_QBRfzKNX-zlx1_WZRhU-hu8w4OSY6VLN4gKFpLPS6ZZrOhfKoYdddIXBp8G7h_quTuaHSdtdGazVMBNgC6GDpmSFcO9JO8zkE-5WxKAW4E1YFd2g9wsdMD17tkU6eE9vQDZqiWtCOXyb1zCB40N3qrJCoiuiGT_pnwlZIox1o3RayVLZho2m7rqKIcPsuu-ClAjjpaf5GZ33zRKEU-3O4hIUdirj1JWdzBUwOMhVaVHFSHeds3NOXX" class="x1i10hfl xjbqb8w x1ejq31n x18oe1m7 x1sy0etr xstzfhl x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1ypdohk xt0psk2 x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz xkrqix3 x1sur9pj x1fey0fg x1s688f" href="https://l.facebook.com/l.php?u=https%3A%2F%2Fgithub.com%2Fdarshilparmar%2Fuber-etl-pipeline-data-engineering-project%3Ffbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBEwTlAybGVoaEtDbjZickgzQ3NydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR4UssT_miIDMRAPkxxeZ0b97crBJuua0eNLqu6f3pFnEnRK4w5eLnx0gW3UDg_aem_H0OWh_lBBbuL42NBPbk0dA&amp;h=AT1UPRxlNrKeSndFxqJIc1NjviDDEY0TPLZdqf4kL4ahbaGXp9Obkd37aE9gGxr12_mj7-MTok3ccPXuPj8FTNFbnjLUtKh4xN6ga_2mB3fJGFXRbr2Ocr7Z6SMdwHGljn-AC_RPYbd2EEbPmAVaPUhuU5AScphs&amp;__tn__=-UK-R&amp;c[0]=AT2piVz801ctb39BQEyevb1bmqoCiqM9UrRvAQdwD-lEaU90txsV6DXyXQxTZUiH8Q9g2ZvDkoIvMpRJ3X3t2Jv9PApwjk-Pxr0c4MeoUcGxWcrKNQ6sB3zj-601O4bcBFP1JXyfA3PVasdUSdhCSAvYxVrvLGUYxojHZerDC8R2Ij_mrFaGfwQZSCREieHjS4rQetLS2xSMAplA-9HNJH-aXodzqg" rel="nofollow noreferrer" role="link" tabindex="0" target="_blank" style="color: rgb(0, 100, 209); cursor: pointer; text-decoration: none; outline: none; text-align: inherit; font-weight: 600; list-style-type: none; display: inline; -webkit-tap-highlight-color: transparent; touch-action: manipulation; border-inline-width: 0px; margin-inline: 0px; border-inline-style: none; padding-inline: 0px; border-top-style: none; border-bottom-width: 0px; border-bottom-style: none; border-top-width: 0px;">https://github.com/.../uber-etl-pipeline-data-engineering...</a></span></div></div><div class="x14z9mp xat24cr x1lziwak x1vvkbs xtlvy1s x126k92a" style="overflow-wrap: break-word; white-space-collapse: preserve; margin-top: 0.5em; margin-inline: 0px; font-family: &quot;Segoe UI Historic&quot;, &quot;Segoe UI&quot;, Helvetica, Arial, sans-serif; color: rgb(8, 8, 9); font-size: 15px;"><div dir="auto" style="font-family: inherit;">---------------------</div><div dir="auto" style="font-family: inherit;">Data Engineer Coaching 1 on 1 - UniGap</div><div dir="auto" style="font-family: inherit;">/Learn Smart. Apply Fast/</div><div dir="auto" style="font-family: inherit;">Hotline: 0829 01 08 21 hoặc 0974 26 01 08</div><div dir="auto" style="font-family: inherit;"><span class="html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs" style="text-align: inherit; overflow-wrap: break-word; margin-inline: 0px; padding-inline: 0px; font-family: inherit;"><a attributionsrc="/privacy_sandbox/comet/register/source/?xt=AZbgR17KguGNc8HauDj2cq-Jyv-q5nu88gEinImrqQ_KHdxgDXO8aGkp2dlRKp-2pJjUDueJg4mj108RxwfBfpd4tTs4FQQkPVsNn3bk_fBlbUCZ6KbOfeoZOlMdPiqjX2FTu-Qf5J_17Btc1a1uPQ8_wlcG0INTB1ANAxJdqXf15326UVVHtzXUXM_rAkuTmXXe50X1wPIf8pf3ORKQZBfFsRxsIeekzB02HjxSiQNk9yN4akxTCafw2a0lUu1XnUauTC1hMGK1T38EaV0ba_650Bju2Y9MwrJRmYyjjFih-NF74-x9aicBvCKstjYVpVKmd_mBiMRyfI5HopjflexB8ItkOgLeOoPTwB8tR6Z2vqywhGc0Ek0SbwiLnPZRPubsRMRdotiVfJQZiSNabMo4EFi6IzgrFSgQDNF4PoRvmWR9NO39K3aVNwmsj6EdqAZGsC6lyyI1Mnn0Nhi5WxLGkU_JZwQCZHrJNv70wg0A_sRqiKhPWe-288Haay_Np6Z4bqPPwaq0y3v9MYwU4bOV_29MYTcMsRYUGMq0X9K4KC6BLAbEiZkkU4-0mDsImfEu21jtEYyCIXJ2A74jt_Y3M0IM93h2gWgar_B4skoSsYdU3lWQhb28ZKVFc-bNaaFi_7_7LMMKds8PkG3DDEsd2zMVzWgiDTv8e7kTKruxv9yNldeW6b4buoKOv2h_k3G7PxIarP-R2IQPhOpOmCi_dCKjdmgtzys_uJXOXP_TlmN9uw7HVba0PEAeoQq6XLiiTReD35ByecgpGouPE-a1sI1pYqwmgyAKg5LJBjQHDx6eTNr4BuLCIyhqu5qiX7xMox81eYO9DwCCbdavxYOKW_WRSQ2IKsRw-lfTDhGgv6eJ2UBckPheiz5p1mMLVb4mUGwJOJwhyqRV5cKiHLMiUdob2iXyz7XFRRpgI-ZYxoyW74Yqa8XLQEtTqLP2WEmKkC7L5FbIhxk6p_FZvEUTw6HJD1fQeYzI0CU1MIaPJaQJrQNtbhFy-LStEftIhkuKPFr3DkqhfS4x4edCIg80gwrRtwJ17vdxH4LhgOBWxOScRCXZ5k1CBFO1-fcGbggHNnC8NFlEAEBGn_IOVWUSmQq00Lx3hkerdtCpd2R3w7Bx60uFrFLhj2_6O9n71Ne4UCVC_lbogFWvnzcojMFrhNlv6bNKG8_XRhm08pBfoWGQ4usvRnymMFdJcX5yZGilg2SKycBaigurq67bgbDheeuef_djYwXFPcu164HeRpQF1B2J9Ebm-2sWZ2GiYnURdB96jAUHfTGSgxDh3_NEMOauLLNEZMqwdx7UYJxeDoBO4jccs3UVqn1geKmqQ_eKUQLp8tMmoz_8gx9JbiYoCr0mEFclqD1-TuVHs2d9Cp2I8CCEtxkfbJIYM8y3pqw9SmX5OZVryQFMuLknM5M4-22Nu25q15Ru3Ed_uCB4lKDjY2WzVny8Nrw6deuEtsmZbkeohA0NPDKheuGr3RPXhcOOvFy44vZS2I-9kdSKF4M64_2bLl0clRwXh-b2XgbgdaB8MJlF4dU7vSlEzbg9avC_t2_Zj_QBRfzKNX-zlx1_WZRhU-hu8w4OSY6VLN4gKFpLPS6ZZrOhfKoYdddIXBp8G7h_quTuaHSdtdGazVMBNgC6GDpmSFcO9JO8zkE-5WxKAW4E1YFd2g9wsdMD17tkU6eE9vQDZqiWtCOXyb1zCB40N3qrJCoiuiGT_pnwlZIox1o3RayVLZho2m7rqKIcPsuu-ClAjjpaf5GZ33zRKEU-3O4hIUdirj1JWdzBUwOMhVaVHFSHeds3NOXX" class="x1i10hfl xjbqb8w x1ejq31n x18oe1m7 x1sy0etr xstzfhl x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1ypdohk xt0psk2 x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz xkrqix3 x1sur9pj x1fey0fg x1s688f" href="https://www.facebook.com/hashtag/unigap?__eep__=6&amp;__cft__[0]=AZaTTacMApkdL4YzAoQ6OMOvO_ZVG6YtUbAlFxkYUPW1lJubV0t9LS_Tdx_JyL1A3upvJQQ-N2ap-BwXtnqCOxxrodk_AZ7vSQ5URDbOasT4EWZRrSbfJQXD1WLOQAGaX_BDzHFT4Pgd1xfduTsXvk4uygSlFRf0mXscuD6IUoCm7i3ubQ4se2rnci5M68-6WwwfLIepbyglDL5RapdpRKjT&amp;__tn__=*NK-R" role="link" tabindex="0" style="color: rgb(0, 100, 209); cursor: pointer; text-decoration: none; outline: none; text-align: inherit; font-weight: 600; list-style-type: none; display: inline; -webkit-tap-highlight-color: transparent; touch-action: manipulation; border-inline-width: 0px; margin-inline: 0px; border-inline-style: none; padding-inline: 0px; border-top-style: none; border-bottom-width: 0px; border-bottom-style: none; border-top-width: 0px;">#unigap</a></span> <span class="html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs" style="text-align: inherit; overflow-wrap: break-word; margin-inline: 0px; padding-inline: 0px; font-family: inherit;"><a attributionsrc="/privacy_sandbox/comet/register/source/?xt=AZbgR17KguGNc8HauDj2cq-Jyv-q5nu88gEinImrqQ_KHdxgDXO8aGkp2dlRKp-2pJjUDueJg4mj108RxwfBfpd4tTs4FQQkPVsNn3bk_fBlbUCZ6KbOfeoZOlMdPiqjX2FTu-Qf5J_17Btc1a1uPQ8_wlcG0INTB1ANAxJdqXf15326UVVHtzXUXM_rAkuTmXXe50X1wPIf8pf3ORKQZBfFsRxsIeekzB02HjxSiQNk9yN4akxTCafw2a0lUu1XnUauTC1hMGK1T38EaV0ba_650Bju2Y9MwrJRmYyjjFih-NF74-x9aicBvCKstjYVpVKmd_mBiMRyfI5HopjflexB8ItkOgLeOoPTwB8tR6Z2vqywhGc0Ek0SbwiLnPZRPubsRMRdotiVfJQZiSNabMo4EFi6IzgrFSgQDNF4PoRvmWR9NO39K3aVNwmsj6EdqAZGsC6lyyI1Mnn0Nhi5WxLGkU_JZwQCZHrJNv70wg0A_sRqiKhPWe-288Haay_Np6Z4bqPPwaq0y3v9MYwU4bOV_29MYTcMsRYUGMq0X9K4KC6BLAbEiZkkU4-0mDsImfEu21jtEYyCIXJ2A74jt_Y3M0IM93h2gWgar_B4skoSsYdU3lWQhb28ZKVFc-bNaaFi_7_7LMMKds8PkG3DDEsd2zMVzWgiDTv8e7kTKruxv9yNldeW6b4buoKOv2h_k3G7PxIarP-R2IQPhOpOmCi_dCKjdmgtzys_uJXOXP_TlmN9uw7HVba0PEAeoQq6XLiiTReD35ByecgpGouPE-a1sI1pYqwmgyAKg5LJBjQHDx6eTNr4BuLCIyhqu5qiX7xMox81eYO9DwCCbdavxYOKW_WRSQ2IKsRw-lfTDhGgv6eJ2UBckPheiz5p1mMLVb4mUGwJOJwhyqRV5cKiHLMiUdob2iXyz7XFRRpgI-ZYxoyW74Yqa8XLQEtTqLP2WEmKkC7L5FbIhxk6p_FZvEUTw6HJD1fQeYzI0CU1MIaPJaQJrQNtbhFy-LStEftIhkuKPFr3DkqhfS4x4edCIg80gwrRtwJ17vdxH4LhgOBWxOScRCXZ5k1CBFO1-fcGbggHNnC8NFlEAEBGn_IOVWUSmQq00Lx3hkerdtCpd2R3w7Bx60uFrFLhj2_6O9n71Ne4UCVC_lbogFWvnzcojMFrhNlv6bNKG8_XRhm08pBfoWGQ4usvRnymMFdJcX5yZGilg2SKycBaigurq67bgbDheeuef_djYwXFPcu164HeRpQF1B2J9Ebm-2sWZ2GiYnURdB96jAUHfTGSgxDh3_NEMOauLLNEZMqwdx7UYJxeDoBO4jccs3UVqn1geKmqQ_eKUQLp8tMmoz_8gx9JbiYoCr0mEFclqD1-TuVHs2d9Cp2I8CCEtxkfbJIYM8y3pqw9SmX5OZVryQFMuLknM5M4-22Nu25q15Ru3Ed_uCB4lKDjY2WzVny8Nrw6deuEtsmZbkeohA0NPDKheuGr3RPXhcOOvFy44vZS2I-9kdSKF4M64_2bLl0clRwXh-b2XgbgdaB8MJlF4dU7vSlEzbg9avC_t2_Zj_QBRfzKNX-zlx1_WZRhU-hu8w4OSY6VLN4gKFpLPS6ZZrOhfKoYdddIXBp8G7h_quTuaHSdtdGazVMBNgC6GDpmSFcO9JO8zkE-5WxKAW4E1YFd2g9wsdMD17tkU6eE9vQDZqiWtCOXyb1zCB40N3qrJCoiuiGT_pnwlZIox1o3RayVLZho2m7rqKIcPsuu-ClAjjpaf5GZ33zRKEU-3O4hIUdirj1JWdzBUwOMhVaVHFSHeds3NOXX" class="x1i10hfl xjbqb8w x1ejq31n x18oe1m7 x1sy0etr xstzfhl x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1ypdohk xt0psk2 x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz xkrqix3 x1sur9pj x1fey0fg x1s688f" href="https://www.facebook.com/hashtag/dataengineer?__eep__=6&amp;__cft__[0]=AZaTTacMApkdL4YzAoQ6OMOvO_ZVG6YtUbAlFxkYUPW1lJubV0t9LS_Tdx_JyL1A3upvJQQ-N2ap-BwXtnqCOxxrodk_AZ7vSQ5URDbOasT4EWZRrSbfJQXD1WLOQAGaX_BDzHFT4Pgd1xfduTsXvk4uygSlFRf0mXscuD6IUoCm7i3ubQ4se2rnci5M68-6WwwfLIepbyglDL5RapdpRKjT&amp;__tn__=*NK-R" role="link" tabindex="0" style="color: rgb(0, 100, 209); cursor: pointer; text-decoration: none; outline: none; text-align: inherit; font-weight: 600; list-style-type: none; display: inline; -webkit-tap-highlight-color: transparent; touch-action: manipulation; border-inline-width: 0px; margin-inline: 0px; border-inline-style: none; padding-inline: 0px; border-top-style: none; border-bottom-width: 0px; border-bottom-style: none; border-top-width: 0px;">#dataengineer</a></span> <span class="html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs" style="text-align: inherit; overflow-wrap: break-word; margin-inline: 0px; padding-inline: 0px; font-family: inherit;"><a attributionsrc="/privacy_sandbox/comet/register/source/?xt=AZbgR17KguGNc8HauDj2cq-Jyv-q5nu88gEinImrqQ_KHdxgDXO8aGkp2dlRKp-2pJjUDueJg4mj108RxwfBfpd4tTs4FQQkPVsNn3bk_fBlbUCZ6KbOfeoZOlMdPiqjX2FTu-Qf5J_17Btc1a1uPQ8_wlcG0INTB1ANAxJdqXf15326UVVHtzXUXM_rAkuTmXXe50X1wPIf8pf3ORKQZBfFsRxsIeekzB02HjxSiQNk9yN4akxTCafw2a0lUu1XnUauTC1hMGK1T38EaV0ba_650Bju2Y9MwrJRmYyjjFih-NF74-x9aicBvCKstjYVpVKmd_mBiMRyfI5HopjflexB8ItkOgLeOoPTwB8tR6Z2vqywhGc0Ek0SbwiLnPZRPubsRMRdotiVfJQZiSNabMo4EFi6IzgrFSgQDNF4PoRvmWR9NO39K3aVNwmsj6EdqAZGsC6lyyI1Mnn0Nhi5WxLGkU_JZwQCZHrJNv70wg0A_sRqiKhPWe-288Haay_Np6Z4bqPPwaq0y3v9MYwU4bOV_29MYTcMsRYUGMq0X9K4KC6BLAbEiZkkU4-0mDsImfEu21jtEYyCIXJ2A74jt_Y3M0IM93h2gWgar_B4skoSsYdU3lWQhb28ZKVFc-bNaaFi_7_7LMMKds8PkG3DDEsd2zMVzWgiDTv8e7kTKruxv9yNldeW6b4buoKOv2h_k3G7PxIarP-R2IQPhOpOmCi_dCKjdmgtzys_uJXOXP_TlmN9uw7HVba0PEAeoQq6XLiiTReD35ByecgpGouPE-a1sI1pYqwmgyAKg5LJBjQHDx6eTNr4BuLCIyhqu5qiX7xMox81eYO9DwCCbdavxYOKW_WRSQ2IKsRw-lfTDhGgv6eJ2UBckPheiz5p1mMLVb4mUGwJOJwhyqRV5cKiHLMiUdob2iXyz7XFRRpgI-ZYxoyW74Yqa8XLQEtTqLP2WEmKkC7L5FbIhxk6p_FZvEUTw6HJD1fQeYzI0CU1MIaPJaQJrQNtbhFy-LStEftIhkuKPFr3DkqhfS4x4edCIg80gwrRtwJ17vdxH4LhgOBWxOScRCXZ5k1CBFO1-fcGbggHNnC8NFlEAEBGn_IOVWUSmQq00Lx3hkerdtCpd2R3w7Bx60uFrFLhj2_6O9n71Ne4UCVC_lbogFWvnzcojMFrhNlv6bNKG8_XRhm08pBfoWGQ4usvRnymMFdJcX5yZGilg2SKycBaigurq67bgbDheeuef_djYwXFPcu164HeRpQF1B2J9Ebm-2sWZ2GiYnURdB96jAUHfTGSgxDh3_NEMOauLLNEZMqwdx7UYJxeDoBO4jccs3UVqn1geKmqQ_eKUQLp8tMmoz_8gx9JbiYoCr0mEFclqD1-TuVHs2d9Cp2I8CCEtxkfbJIYM8y3pqw9SmX5OZVryQFMuLknM5M4-22Nu25q15Ru3Ed_uCB4lKDjY2WzVny8Nrw6deuEtsmZbkeohA0NPDKheuGr3RPXhcOOvFy44vZS2I-9kdSKF4M64_2bLl0clRwXh-b2XgbgdaB8MJlF4dU7vSlEzbg9avC_t2_Zj_QBRfzKNX-zlx1_WZRhU-hu8w4OSY6VLN4gKFpLPS6ZZrOhfKoYdddIXBp8G7h_quTuaHSdtdGazVMBNgC6GDpmSFcO9JO8zkE-5WxKAW4E1YFd2g9wsdMD17tkU6eE9vQDZqiWtCOXyb1zCB40N3qrJCoiuiGT_pnwlZIox1o3RayVLZho2m7rqKIcPsuu-ClAjjpaf5GZ33zRKEU-3O4hIUdirj1JWdzBUwOMhVaVHFSHeds3NOXX" class="x1i10hfl xjbqb8w x1ejq31n x18oe1m7 x1sy0etr xstzfhl x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1ypdohk xt0psk2 x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz xkrqix3 x1sur9pj x1fey0fg x1s688f" href="https://www.facebook.com/hashtag/coaching1on1?__eep__=6&amp;__cft__[0]=AZaTTacMApkdL4YzAoQ6OMOvO_ZVG6YtUbAlFxkYUPW1lJubV0t9LS_Tdx_JyL1A3upvJQQ-N2ap-BwXtnqCOxxrodk_AZ7vSQ5URDbOasT4EWZRrSbfJQXD1WLOQAGaX_BDzHFT4Pgd1xfduTsXvk4uygSlFRf0mXscuD6IUoCm7i3ubQ4se2rnci5M68-6WwwfLIepbyglDL5RapdpRKjT&amp;__tn__=*NK-R" role="link" tabindex="0" style="color: rgb(0, 100, 209); cursor: pointer; text-decoration: none; outline: none; text-align: inherit; font-weight: 600; list-style-type: none; display: inline; -webkit-tap-highlight-color: transparent; touch-action: manipulation; border-inline-width: 0px; margin-inline: 0px; border-inline-style: none; padding-inline: 0px; border-top-style: none; border-bottom-width: 0px; border-bottom-style: none; border-top-width: 0px;">#coaching1on1</a></span> <span class="html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs" style="text-align: inherit; overflow-wrap: break-word; margin-inline: 0px; padding-inline: 0px; font-family: inherit;"><a attributionsrc="/privacy_sandbox/comet/register/source/?xt=AZbgR17KguGNc8HauDj2cq-Jyv-q5nu88gEinImrqQ_KHdxgDXO8aGkp2dlRKp-2pJjUDueJg4mj108RxwfBfpd4tTs4FQQkPVsNn3bk_fBlbUCZ6KbOfeoZOlMdPiqjX2FTu-Qf5J_17Btc1a1uPQ8_wlcG0INTB1ANAxJdqXf15326UVVHtzXUXM_rAkuTmXXe50X1wPIf8pf3ORKQZBfFsRxsIeekzB02HjxSiQNk9yN4akxTCafw2a0lUu1XnUauTC1hMGK1T38EaV0ba_650Bju2Y9MwrJRmYyjjFih-NF74-x9aicBvCKstjYVpVKmd_mBiMRyfI5HopjflexB8ItkOgLeOoPTwB8tR6Z2vqywhGc0Ek0SbwiLnPZRPubsRMRdotiVfJQZiSNabMo4EFi6IzgrFSgQDNF4PoRvmWR9NO39K3aVNwmsj6EdqAZGsC6lyyI1Mnn0Nhi5WxLGkU_JZwQCZHrJNv70wg0A_sRqiKhPWe-288Haay_Np6Z4bqPPwaq0y3v9MYwU4bOV_29MYTcMsRYUGMq0X9K4KC6BLAbEiZkkU4-0mDsImfEu21jtEYyCIXJ2A74jt_Y3M0IM93h2gWgar_B4skoSsYdU3lWQhb28ZKVFc-bNaaFi_7_7LMMKds8PkG3DDEsd2zMVzWgiDTv8e7kTKruxv9yNldeW6b4buoKOv2h_k3G7PxIarP-R2IQPhOpOmCi_dCKjdmgtzys_uJXOXP_TlmN9uw7HVba0PEAeoQq6XLiiTReD35ByecgpGouPE-a1sI1pYqwmgyAKg5LJBjQHDx6eTNr4BuLCIyhqu5qiX7xMox81eYO9DwCCbdavxYOKW_WRSQ2IKsRw-lfTDhGgv6eJ2UBckPheiz5p1mMLVb4mUGwJOJwhyqRV5cKiHLMiUdob2iXyz7XFRRpgI-ZYxoyW74Yqa8XLQEtTqLP2WEmKkC7L5FbIhxk6p_FZvEUTw6HJD1fQeYzI0CU1MIaPJaQJrQNtbhFy-LStEftIhkuKPFr3DkqhfS4x4edCIg80gwrRtwJ17vdxH4LhgOBWxOScRCXZ5k1CBFO1-fcGbggHNnC8NFlEAEBGn_IOVWUSmQq00Lx3hkerdtCpd2R3w7Bx60uFrFLhj2_6O9n71Ne4UCVC_lbogFWvnzcojMFrhNlv6bNKG8_XRhm08pBfoWGQ4usvRnymMFdJcX5yZGilg2SKycBaigurq67bgbDheeuef_djYwXFPcu164HeRpQF1B2J9Ebm-2sWZ2GiYnURdB96jAUHfTGSgxDh3_NEMOauLLNEZMqwdx7UYJxeDoBO4jccs3UVqn1geKmqQ_eKUQLp8tMmoz_8gx9JbiYoCr0mEFclqD1-TuVHs2d9Cp2I8CCEtxkfbJIYM8y3pqw9SmX5OZVryQFMuLknM5M4-22Nu25q15Ru3Ed_uCB4lKDjY2WzVny8Nrw6deuEtsmZbkeohA0NPDKheuGr3RPXhcOOvFy44vZS2I-9kdSKF4M64_2bLl0clRwXh-b2XgbgdaB8MJlF4dU7vSlEzbg9avC_t2_Zj_QBRfzKNX-zlx1_WZRhU-hu8w4OSY6VLN4gKFpLPS6ZZrOhfKoYdddIXBp8G7h_quTuaHSdtdGazVMBNgC6GDpmSFcO9JO8zkE-5WxKAW4E1YFd2g9wsdMD17tkU6eE9vQDZqiWtCOXyb1zCB40N3qrJCoiuiGT_pnwlZIox1o3RayVLZho2m7rqKIcPsuu-ClAjjpaf5GZ33zRKEU-3O4hIUdirj1JWdzBUwOMhVaVHFSHeds3NOXX" class="x1i10hfl xjbqb8w x1ejq31n x18oe1m7 x1sy0etr xstzfhl x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1ypdohk xt0psk2 x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz xkrqix3 x1sur9pj x1fey0fg x1s688f" href="https://www.facebook.com/hashtag/kysudulieu?__eep__=6&amp;__cft__[0]=AZaTTacMApkdL4YzAoQ6OMOvO_ZVG6YtUbAlFxkYUPW1lJubV0t9LS_Tdx_JyL1A3upvJQQ-N2ap-BwXtnqCOxxrodk_AZ7vSQ5URDbOasT4EWZRrSbfJQXD1WLOQAGaX_BDzHFT4Pgd1xfduTsXvk4uygSlFRf0mXscuD6IUoCm7i3ubQ4se2rnci5M68-6WwwfLIepbyglDL5RapdpRKjT&amp;__tn__=*NK-R" role="link" tabindex="0" style="color: rgb(0, 100, 209); cursor: pointer; text-decoration: none; outline: none; text-align: inherit; font-weight: 600; list-style-type: none; display: inline; -webkit-tap-highlight-color: transparent; touch-action: manipulation; border-inline-width: 0px; margin-inline: 0px; border-inline-style: none; padding-inline: 0px; border-top-style: none; border-bottom-width: 0px; border-bottom-style: none; border-top-width: 0px;">#kysudulieu</a></span> <span class="html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs" style="text-align: inherit; overflow-wrap: break-word; margin-inline: 0px; padding-inline: 0px; font-family: inherit;"><a attributionsrc="/privacy_sandbox/comet/register/source/?xt=AZbgR17KguGNc8HauDj2cq-Jyv-q5nu88gEinImrqQ_KHdxgDXO8aGkp2dlRKp-2pJjUDueJg4mj108RxwfBfpd4tTs4FQQkPVsNn3bk_fBlbUCZ6KbOfeoZOlMdPiqjX2FTu-Qf5J_17Btc1a1uPQ8_wlcG0INTB1ANAxJdqXf15326UVVHtzXUXM_rAkuTmXXe50X1wPIf8pf3ORKQZBfFsRxsIeekzB02HjxSiQNk9yN4akxTCafw2a0lUu1XnUauTC1hMGK1T38EaV0ba_650Bju2Y9MwrJRmYyjjFih-NF74-x9aicBvCKstjYVpVKmd_mBiMRyfI5HopjflexB8ItkOgLeOoPTwB8tR6Z2vqywhGc0Ek0SbwiLnPZRPubsRMRdotiVfJQZiSNabMo4EFi6IzgrFSgQDNF4PoRvmWR9NO39K3aVNwmsj6EdqAZGsC6lyyI1Mnn0Nhi5WxLGkU_JZwQCZHrJNv70wg0A_sRqiKhPWe-288Haay_Np6Z4bqPPwaq0y3v9MYwU4bOV_29MYTcMsRYUGMq0X9K4KC6BLAbEiZkkU4-0mDsImfEu21jtEYyCIXJ2A74jt_Y3M0IM93h2gWgar_B4skoSsYdU3lWQhb28ZKVFc-bNaaFi_7_7LMMKds8PkG3DDEsd2zMVzWgiDTv8e7kTKruxv9yNldeW6b4buoKOv2h_k3G7PxIarP-R2IQPhOpOmCi_dCKjdmgtzys_uJXOXP_TlmN9uw7HVba0PEAeoQq6XLiiTReD35ByecgpGouPE-a1sI1pYqwmgyAKg5LJBjQHDx6eTNr4BuLCIyhqu5qiX7xMox81eYO9DwCCbdavxYOKW_WRSQ2IKsRw-lfTDhGgv6eJ2UBckPheiz5p1mMLVb4mUGwJOJwhyqRV5cKiHLMiUdob2iXyz7XFRRpgI-ZYxoyW74Yqa8XLQEtTqLP2WEmKkC7L5FbIhxk6p_FZvEUTw6HJD1fQeYzI0CU1MIaPJaQJrQNtbhFy-LStEftIhkuKPFr3DkqhfS4x4edCIg80gwrRtwJ17vdxH4LhgOBWxOScRCXZ5k1CBFO1-fcGbggHNnC8NFlEAEBGn_IOVWUSmQq00Lx3hkerdtCpd2R3w7Bx60uFrFLhj2_6O9n71Ne4UCVC_lbogFWvnzcojMFrhNlv6bNKG8_XRhm08pBfoWGQ4usvRnymMFdJcX5yZGilg2SKycBaigurq67bgbDheeuef_djYwXFPcu164HeRpQF1B2J9Ebm-2sWZ2GiYnURdB96jAUHfTGSgxDh3_NEMOauLLNEZMqwdx7UYJxeDoBO4jccs3UVqn1geKmqQ_eKUQLp8tMmoz_8gx9JbiYoCr0mEFclqD1-TuVHs2d9Cp2I8CCEtxkfbJIYM8y3pqw9SmX5OZVryQFMuLknM5M4-22Nu25q15Ru3Ed_uCB4lKDjY2WzVny8Nrw6deuEtsmZbkeohA0NPDKheuGr3RPXhcOOvFy44vZS2I-9kdSKF4M64_2bLl0clRwXh-b2XgbgdaB8MJlF4dU7vSlEzbg9avC_t2_Zj_QBRfzKNX-zlx1_WZRhU-hu8w4OSY6VLN4gKFpLPS6ZZrOhfKoYdddIXBp8G7h_quTuaHSdtdGazVMBNgC6GDpmSFcO9JO8zkE-5WxKAW4E1YFd2g9wsdMD17tkU6eE9vQDZqiWtCOXyb1zCB40N3qrJCoiuiGT_pnwlZIox1o3RayVLZho2m7rqKIcPsuu-ClAjjpaf5GZ33zRKEU-3O4hIUdirj1JWdzBUwOMhVaVHFSHeds3NOXX" class="x1i10hfl xjbqb8w x1ejq31n x18oe1m7 x1sy0etr xstzfhl x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1ypdohk xt0psk2 x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz xkrqix3 x1sur9pj x1fey0fg x1s688f" href="https://www.facebook.com/hashtag/datapipeline?__eep__=6&amp;__cft__[0]=AZaTTacMApkdL4YzAoQ6OMOvO_ZVG6YtUbAlFxkYUPW1lJubV0t9LS_Tdx_JyL1A3upvJQQ-N2ap-BwXtnqCOxxrodk_AZ7vSQ5URDbOasT4EWZRrSbfJQXD1WLOQAGaX_BDzHFT4Pgd1xfduTsXvk4uygSlFRf0mXscuD6IUoCm7i3ubQ4se2rnci5M68-6WwwfLIepbyglDL5RapdpRKjT&amp;__tn__=*NK-R" role="link" tabindex="0" style="color: rgb(0, 100, 209); cursor: pointer; text-decoration: none; outline: none; text-align: inherit; font-weight: 600; list-style-type: none; display: inline; -webkit-tap-highlight-color: transparent; touch-action: manipulation; border-inline-width: 0px; margin-inline: 0px; border-inline-style: none; padding-inline: 0px; border-top-style: none; border-bottom-width: 0px; border-bottom-style: none; border-top-width: 0px;">#datapipeline</a></span> <span class="html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs" style="text-align: inherit; overflow-wrap: break-word; margin-inline: 0px; padding-inline: 0px; font-family: inherit;"><a attributionsrc="/privacy_sandbox/comet/register/source/?xt=AZbgR17KguGNc8HauDj2cq-Jyv-q5nu88gEinImrqQ_KHdxgDXO8aGkp2dlRKp-2pJjUDueJg4mj108RxwfBfpd4tTs4FQQkPVsNn3bk_fBlbUCZ6KbOfeoZOlMdPiqjX2FTu-Qf5J_17Btc1a1uPQ8_wlcG0INTB1ANAxJdqXf15326UVVHtzXUXM_rAkuTmXXe50X1wPIf8pf3ORKQZBfFsRxsIeekzB02HjxSiQNk9yN4akxTCafw2a0lUu1XnUauTC1hMGK1T38EaV0ba_650Bju2Y9MwrJRmYyjjFih-NF74-x9aicBvCKstjYVpVKmd_mBiMRyfI5HopjflexB8ItkOgLeOoPTwB8tR6Z2vqywhGc0Ek0SbwiLnPZRPubsRMRdotiVfJQZiSNabMo4EFi6IzgrFSgQDNF4PoRvmWR9NO39K3aVNwmsj6EdqAZGsC6lyyI1Mnn0Nhi5WxLGkU_JZwQCZHrJNv70wg0A_sRqiKhPWe-288Haay_Np6Z4bqPPwaq0y3v9MYwU4bOV_29MYTcMsRYUGMq0X9K4KC6BLAbEiZkkU4-0mDsImfEu21jtEYyCIXJ2A74jt_Y3M0IM93h2gWgar_B4skoSsYdU3lWQhb28ZKVFc-bNaaFi_7_7LMMKds8PkG3DDEsd2zMVzWgiDTv8e7kTKruxv9yNldeW6b4buoKOv2h_k3G7PxIarP-R2IQPhOpOmCi_dCKjdmgtzys_uJXOXP_TlmN9uw7HVba0PEAeoQq6XLiiTReD35ByecgpGouPE-a1sI1pYqwmgyAKg5LJBjQHDx6eTNr4BuLCIyhqu5qiX7xMox81eYO9DwCCbdavxYOKW_WRSQ2IKsRw-lfTDhGgv6eJ2UBckPheiz5p1mMLVb4mUGwJOJwhyqRV5cKiHLMiUdob2iXyz7XFRRpgI-ZYxoyW74Yqa8XLQEtTqLP2WEmKkC7L5FbIhxk6p_FZvEUTw6HJD1fQeYzI0CU1MIaPJaQJrQNtbhFy-LStEftIhkuKPFr3DkqhfS4x4edCIg80gwrRtwJ17vdxH4LhgOBWxOScRCXZ5k1CBFO1-fcGbggHNnC8NFlEAEBGn_IOVWUSmQq00Lx3hkerdtCpd2R3w7Bx60uFrFLhj2_6O9n71Ne4UCVC_lbogFWvnzcojMFrhNlv6bNKG8_XRhm08pBfoWGQ4usvRnymMFdJcX5yZGilg2SKycBaigurq67bgbDheeuef_djYwXFPcu164HeRpQF1B2J9Ebm-2sWZ2GiYnURdB96jAUHfTGSgxDh3_NEMOauLLNEZMqwdx7UYJxeDoBO4jccs3UVqn1geKmqQ_eKUQLp8tMmoz_8gx9JbiYoCr0mEFclqD1-TuVHs2d9Cp2I8CCEtxkfbJIYM8y3pqw9SmX5OZVryQFMuLknM5M4-22Nu25q15Ru3Ed_uCB4lKDjY2WzVny8Nrw6deuEtsmZbkeohA0NPDKheuGr3RPXhcOOvFy44vZS2I-9kdSKF4M64_2bLl0clRwXh-b2XgbgdaB8MJlF4dU7vSlEzbg9avC_t2_Zj_QBRfzKNX-zlx1_WZRhU-hu8w4OSY6VLN4gKFpLPS6ZZrOhfKoYdddIXBp8G7h_quTuaHSdtdGazVMBNgC6GDpmSFcO9JO8zkE-5WxKAW4E1YFd2g9wsdMD17tkU6eE9vQDZqiWtCOXyb1zCB40N3qrJCoiuiGT_pnwlZIox1o3RayVLZho2m7rqKIcPsuu-ClAjjpaf5GZ33zRKEU-3O4hIUdirj1JWdzBUwOMhVaVHFSHeds3NOXX" class="x1i10hfl xjbqb8w x1ejq31n x18oe1m7 x1sy0etr xstzfhl x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1ypdohk xt0psk2 x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz xkrqix3 x1sur9pj x1fey0fg x1s688f" href="https://www.facebook.com/hashtag/dataplatform?__eep__=6&amp;__cft__[0]=AZaTTacMApkdL4YzAoQ6OMOvO_ZVG6YtUbAlFxkYUPW1lJubV0t9LS_Tdx_JyL1A3upvJQQ-N2ap-BwXtnqCOxxrodk_AZ7vSQ5URDbOasT4EWZRrSbfJQXD1WLOQAGaX_BDzHFT4Pgd1xfduTsXvk4uygSlFRf0mXscuD6IUoCm7i3ubQ4se2rnci5M68-6WwwfLIepbyglDL5RapdpRKjT&amp;__tn__=*NK-R" role="link" tabindex="0" style="color: rgb(0, 100, 209); cursor: pointer; text-decoration: none; outline: none; text-align: inherit; font-weight: 600; list-style-type: none; display: inline; -webkit-tap-highlight-color: transparent; touch-action: manipulation; border-inline-width: 0px; margin-inline: 0px; border-inline-style: none; padding-inline: 0px; border-top-style: none; border-bottom-width: 0px; border-bottom-style: none; border-top-width: 0px;">#dataplatform</a></span> <span class="html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs" style="text-align: inherit; overflow-wrap: break-word; margin-inline: 0px; padding-inline: 0px; font-family: inherit;"><a attributionsrc="/privacy_sandbox/comet/register/source/?xt=AZbgR17KguGNc8HauDj2cq-Jyv-q5nu88gEinImrqQ_KHdxgDXO8aGkp2dlRKp-2pJjUDueJg4mj108RxwfBfpd4tTs4FQQkPVsNn3bk_fBlbUCZ6KbOfeoZOlMdPiqjX2FTu-Qf5J_17Btc1a1uPQ8_wlcG0INTB1ANAxJdqXf15326UVVHtzXUXM_rAkuTmXXe50X1wPIf8pf3ORKQZBfFsRxsIeekzB02HjxSiQNk9yN4akxTCafw2a0lUu1XnUauTC1hMGK1T38EaV0ba_650Bju2Y9MwrJRmYyjjFih-NF74-x9aicBvCKstjYVpVKmd_mBiMRyfI5HopjflexB8ItkOgLeOoPTwB8tR6Z2vqywhGc0Ek0SbwiLnPZRPubsRMRdotiVfJQZiSNabMo4EFi6IzgrFSgQDNF4PoRvmWR9NO39K3aVNwmsj6EdqAZGsC6lyyI1Mnn0Nhi5WxLGkU_JZwQCZHrJNv70wg0A_sRqiKhPWe-288Haay_Np6Z4bqPPwaq0y3v9MYwU4bOV_29MYTcMsRYUGMq0X9K4KC6BLAbEiZkkU4-0mDsImfEu21jtEYyCIXJ2A74jt_Y3M0IM93h2gWgar_B4skoSsYdU3lWQhb28ZKVFc-bNaaFi_7_7LMMKds8PkG3DDEsd2zMVzWgiDTv8e7kTKruxv9yNldeW6b4buoKOv2h_k3G7PxIarP-R2IQPhOpOmCi_dCKjdmgtzys_uJXOXP_TlmN9uw7HVba0PEAeoQq6XLiiTReD35ByecgpGouPE-a1sI1pYqwmgyAKg5LJBjQHDx6eTNr4BuLCIyhqu5qiX7xMox81eYO9DwCCbdavxYOKW_WRSQ2IKsRw-lfTDhGgv6eJ2UBckPheiz5p1mMLVb4mUGwJOJwhyqRV5cKiHLMiUdob2iXyz7XFRRpgI-ZYxoyW74Yqa8XLQEtTqLP2WEmKkC7L5FbIhxk6p_FZvEUTw6HJD1fQeYzI0CU1MIaPJaQJrQNtbhFy-LStEftIhkuKPFr3DkqhfS4x4edCIg80gwrRtwJ17vdxH4LhgOBWxOScRCXZ5k1CBFO1-fcGbggHNnC8NFlEAEBGn_IOVWUSmQq00Lx3hkerdtCpd2R3w7Bx60uFrFLhj2_6O9n71Ne4UCVC_lbogFWvnzcojMFrhNlv6bNKG8_XRhm08pBfoWGQ4usvRnymMFdJcX5yZGilg2SKycBaigurq67bgbDheeuef_djYwXFPcu164HeRpQF1B2J9Ebm-2sWZ2GiYnURdB96jAUHfTGSgxDh3_NEMOauLLNEZMqwdx7UYJxeDoBO4jccs3UVqn1geKmqQ_eKUQLp8tMmoz_8gx9JbiYoCr0mEFclqD1-TuVHs2d9Cp2I8CCEtxkfbJIYM8y3pqw9SmX5OZVryQFMuLknM5M4-22Nu25q15Ru3Ed_uCB4lKDjY2WzVny8Nrw6deuEtsmZbkeohA0NPDKheuGr3RPXhcOOvFy44vZS2I-9kdSKF4M64_2bLl0clRwXh-b2XgbgdaB8MJlF4dU7vSlEzbg9avC_t2_Zj_QBRfzKNX-zlx1_WZRhU-hu8w4OSY6VLN4gKFpLPS6ZZrOhfKoYdddIXBp8G7h_quTuaHSdtdGazVMBNgC6GDpmSFcO9JO8zkE-5WxKAW4E1YFd2g9wsdMD17tkU6eE9vQDZqiWtCOXyb1zCB40N3qrJCoiuiGT_pnwlZIox1o3RayVLZho2m7rqKIcPsuu-ClAjjpaf5GZ33zRKEU-3O4hIUdirj1JWdzBUwOMhVaVHFSHeds3NOXX" class="x1i10hfl xjbqb8w x1ejq31n x18oe1m7 x1sy0etr xstzfhl x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1ypdohk xt0psk2 x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz xkrqix3 x1sur9pj x1fey0fg x1s688f" href="https://www.facebook.com/hashtag/bigdata?__eep__=6&amp;__cft__[0]=AZaTTacMApkdL4YzAoQ6OMOvO_ZVG6YtUbAlFxkYUPW1lJubV0t9LS_Tdx_JyL1A3upvJQQ-N2ap-BwXtnqCOxxrodk_AZ7vSQ5URDbOasT4EWZRrSbfJQXD1WLOQAGaX_BDzHFT4Pgd1xfduTsXvk4uygSlFRf0mXscuD6IUoCm7i3ubQ4se2rnci5M68-6WwwfLIepbyglDL5RapdpRKjT&amp;__tn__=*NK-R" role="link" tabindex="0" style="color: rgb(0, 100, 209); cursor: pointer; text-decoration: none; outline: none; text-align: inherit; font-weight: 600; list-style-type: none; display: inline; -webkit-tap-highlight-color: transparent; touch-action: manipulation; border-inline-width: 0px; margin-inline: 0px; border-inline-style: none; padding-inline: 0px; border-top-style: none; border-bottom-width: 0px; border-bottom-style: none; border-top-width: 0px;">#bigdata</a></span> <span class="html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs" style="text-align: inherit; overflow-wrap: break-word; margin-inline: 0px; padding-inline: 0px; font-family: inherit;"><a attributionsrc="/privacy_sandbox/comet/register/source/?xt=AZbgR17KguGNc8HauDj2cq-Jyv-q5nu88gEinImrqQ_KHdxgDXO8aGkp2dlRKp-2pJjUDueJg4mj108RxwfBfpd4tTs4FQQkPVsNn3bk_fBlbUCZ6KbOfeoZOlMdPiqjX2FTu-Qf5J_17Btc1a1uPQ8_wlcG0INTB1ANAxJdqXf15326UVVHtzXUXM_rAkuTmXXe50X1wPIf8pf3ORKQZBfFsRxsIeekzB02HjxSiQNk9yN4akxTCafw2a0lUu1XnUauTC1hMGK1T38EaV0ba_650Bju2Y9MwrJRmYyjjFih-NF74-x9aicBvCKstjYVpVKmd_mBiMRyfI5HopjflexB8ItkOgLeOoPTwB8tR6Z2vqywhGc0Ek0SbwiLnPZRPubsRMRdotiVfJQZiSNabMo4EFi6IzgrFSgQDNF4PoRvmWR9NO39K3aVNwmsj6EdqAZGsC6lyyI1Mnn0Nhi5WxLGkU_JZwQCZHrJNv70wg0A_sRqiKhPWe-288Haay_Np6Z4bqPPwaq0y3v9MYwU4bOV_29MYTcMsRYUGMq0X9K4KC6BLAbEiZkkU4-0mDsImfEu21jtEYyCIXJ2A74jt_Y3M0IM93h2gWgar_B4skoSsYdU3lWQhb28ZKVFc-bNaaFi_7_7LMMKds8PkG3DDEsd2zMVzWgiDTv8e7kTKruxv9yNldeW6b4buoKOv2h_k3G7PxIarP-R2IQPhOpOmCi_dCKjdmgtzys_uJXOXP_TlmN9uw7HVba0PEAeoQq6XLiiTReD35ByecgpGouPE-a1sI1pYqwmgyAKg5LJBjQHDx6eTNr4BuLCIyhqu5qiX7xMox81eYO9DwCCbdavxYOKW_WRSQ2IKsRw-lfTDhGgv6eJ2UBckPheiz5p1mMLVb4mUGwJOJwhyqRV5cKiHLMiUdob2iXyz7XFRRpgI-ZYxoyW74Yqa8XLQEtTqLP2WEmKkC7L5FbIhxk6p_FZvEUTw6HJD1fQeYzI0CU1MIaPJaQJrQNtbhFy-LStEftIhkuKPFr3DkqhfS4x4edCIg80gwrRtwJ17vdxH4LhgOBWxOScRCXZ5k1CBFO1-fcGbggHNnC8NFlEAEBGn_IOVWUSmQq00Lx3hkerdtCpd2R3w7Bx60uFrFLhj2_6O9n71Ne4UCVC_lbogFWvnzcojMFrhNlv6bNKG8_XRhm08pBfoWGQ4usvRnymMFdJcX5yZGilg2SKycBaigurq67bgbDheeuef_djYwXFPcu164HeRpQF1B2J9Ebm-2sWZ2GiYnURdB96jAUHfTGSgxDh3_NEMOauLLNEZMqwdx7UYJxeDoBO4jccs3UVqn1geKmqQ_eKUQLp8tMmoz_8gx9JbiYoCr0mEFclqD1-TuVHs2d9Cp2I8CCEtxkfbJIYM8y3pqw9SmX5OZVryQFMuLknM5M4-22Nu25q15Ru3Ed_uCB4lKDjY2WzVny8Nrw6deuEtsmZbkeohA0NPDKheuGr3RPXhcOOvFy44vZS2I-9kdSKF4M64_2bLl0clRwXh-b2XgbgdaB8MJlF4dU7vSlEzbg9avC_t2_Zj_QBRfzKNX-zlx1_WZRhU-hu8w4OSY6VLN4gKFpLPS6ZZrOhfKoYdddIXBp8G7h_quTuaHSdtdGazVMBNgC6GDpmSFcO9JO8zkE-5WxKAW4E1YFd2g9wsdMD17tkU6eE9vQDZqiWtCOXyb1zCB40N3qrJCoiuiGT_pnwlZIox1o3RayVLZho2m7rqKIcPsuu-ClAjjpaf5GZ33zRKEU-3O4hIUdirj1JWdzBUwOMhVaVHFSHeds3NOXX" class="x1i10hfl xjbqb8w x1ejq31n x18oe1m7 x1sy0etr xstzfhl x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1ypdohk xt0psk2 x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz xkrqix3 x1sur9pj x1fey0fg x1s688f" href="https://www.facebook.com/hashtag/dataengineercoaching1on1?__eep__=6&amp;__cft__[0]=AZaTTacMApkdL4YzAoQ6OMOvO_ZVG6YtUbAlFxkYUPW1lJubV0t9LS_Tdx_JyL1A3upvJQQ-N2ap-BwXtnqCOxxrodk_AZ7vSQ5URDbOasT4EWZRrSbfJQXD1WLOQAGaX_BDzHFT4Pgd1xfduTsXvk4uygSlFRf0mXscuD6IUoCm7i3ubQ4se2rnci5M68-6WwwfLIepbyglDL5RapdpRKjT&amp;__tn__=*NK-R" role="link" tabindex="0" style="color: rgb(0, 100, 209); cursor: pointer; text-decoration: none; outline: none; text-align: inherit; font-weight: 600; list-style-type: none; display: inline; -webkit-tap-highlight-color: transparent; touch-action: manipulation; border-inline-width: 0px; margin-inline: 0px; border-inline-style: none; padding-inline: 0px; border-top-style: none; border-bottom-width: 0px; border-bottom-style: none; border-top-width: 0px;">#dataengineercoaching1on1</a></span></div><div dir="auto" style="font-family: inherit;"><span class="html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs" style="text-align: inherit; overflow-wrap: break-word; margin-inline: 0px; padding-inline: 0px; font-family: inherit;"><br></span></div><div dir="auto" style="font-family: inherit;"><img src="/static/uploads/news/vn/news_16/20251218_223229_601884298_872636842384441_2990118088193312896_n.jpg" style="width: 737.6px;"><span class="html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs" style="text-align: inherit; overflow-wrap: break-word; margin-inline: 0px; padding-inline: 0px; font-family: inherit;"><br></span></div></div>', '/static/uploads/news/vn/news_16/20251218_223215_383775830_282201141428017_7484135846809993505_n.jpg', '["/static/uploads/news/vn/news_16/20251218_223050_image.png", "/static/uploads/news/vn/news_16/20251218_223229_601884298_872636842384441_2990118088193312896_n.jpg"]', 1, 2, 1, 'published', false, false, 0, NULL, NULL, NULL, '2025-12-18 15:53:57.810711', '2025-12-18 15:33:25.920794', '2025-12-18 15:53:57.824212', false, false, NULL, NULL);
INSERT INTO public.news VALUES (15, 'Cổ động viên TP.HCM vỡ òa khi U22 Việt Nam vượt lên Thái Lan', 'co-dong-vien-tphcm-vo-oa-khi-u22-viet-nam-vuot-len-thai-lan-pending', 'Tối 18/12, khu vực đường Lê Lợi (TP.HCM) chật kín người hâm mộ tập trung theo dõi và cổ vũ U22 Việt Nam trong trận đối đầu với tuyển Thái Lan tại chung kết SEA Games 33.', '<p><span style="color: rgb(51, 51, 51); font-family: &quot;Noto Serif&quot;, serif; font-size: 17.6px; font-weight: 700; text-align: center;">Tối 18/12, khu vực đường Lê Lợi (TP.HCM) chật kín người hâm mộ tập trung theo dõi và cổ vũ U22 Việt Nam trong trận đối đầu với tuyển Thái Lan tại chung kết SEA Games 33.</span></p><p><img src="/static/uploads/news/vn/news_15/20251218_221306_bongda-36-1766069499.webp" style="width: 737.6px;"><img src="/static/uploads/news/vn/news_15/20251218_221338_co_vu_1_znews.webp" style="width: 737.6px;"></p><p><span style="color: rgb(51, 51, 51); font-size: 19.008px;">Đường Lê Lợi (đoạn từ đường Phan Bội Châu đến Nam Kỳ Khởi Nghĩa) là nơi lắp đặt màn hình LED cỡ lớn phục vụ người dân xem trận chung kết SEA Games 33. Từ trước khi trận đấu bắt đầu, hàng nghìn người dân đã nhuộm đỏ cả một khu vực với những chiếc áo cờ đỏ sao vàng, băng rôn, cờ Tổ quốc. Ảnh:&nbsp;</span><em style="text-rendering: geometricprecision; outline: 0px; -webkit-font-smoothing: antialiased; border: 0px; font-size: 19.008px; vertical-align: baseline; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; text-size-adjust: 100%; color: rgb(51, 51, 51);">Hoài Bảo.</em></p><p><img src="/static/uploads/news/vn/news_15/20251218_221417_co_vu_9_znews.webp" style="width: 737.6px;"><span style="color: rgb(51, 51, 51); font-size: 19.008px;">Người dân mang theo đủ loại loa, kèn để tiếp lửa cho đội tuyển, khiến không khí cổ vũ trở nên náo nhiệt, hừng hực khí thế. Ảnh:&nbsp;</span><em style="background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; text-rendering: geometricprecision; outline: 0px; -webkit-font-smoothing: antialiased; border: 0px; font-size: 19.008px; vertical-align: baseline; text-size-adjust: 100%; color: rgb(51, 51, 51);">Hoài Bảo.</em><em style="text-rendering: geometricprecision; outline: 0px; -webkit-font-smoothing: antialiased; border: 0px; font-size: 19.008px; vertical-align: baseline; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; text-size-adjust: 100%; color: rgb(51, 51, 51);"><br></em></p>', '/static/uploads/news/vn/news_15/20251218_221132_bongda-36-1766069499.webp', '["/static/uploads/news/vn/news_15/20251218_221306_bongda-36-1766069499.webp", "/static/uploads/news/vn/news_15/20251218_221338_co_vu_1_znews.webp", "/static/uploads/news/vn/news_15/20251218_221417_co_vu_9_znews.webp"]', 9, 2, 1, 'published', false, false, 2, NULL, NULL, NULL, '2025-12-18 15:16:48.948838', '2025-12-18 15:16:00.002159', '2025-12-22 14:13:33.083365', false, false, NULL, NULL);


--
-- TOC entry 5144 (class 0 OID 16997)
-- Dependencies: 234
-- Data for Name: news_api; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5148 (class 0 OID 17027)
-- Dependencies: 238
-- Data for Name: news_international; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.news_international VALUES (2, 'Speeding bus flips on Indonesian highway, killing at least 16', 'speeding-bus-flips-on-indonesian-highway-killing-at-least-16', 'A coach bus slammed into a barrier on an Indonesian highway early Monday, flipping over in an accident that killed at least 16 people, a rescue worker said.', '<p>The bus, which was headed from the capital Jakarta to Yogyakarta, was travelling at a "fairly high" speed when it reached a turn at a highway interchange, local search and rescue agency head Budiono said in a statement.</p>
<p>It overturned after colliding with the road barrier.</p>
<p>"We ... have evacuated 34 people," said Budiono, who goes by one name.</p>
<p>He added that 15 people were pronounced dead at the scene, while another person died in hospital.</p>
<p>Several victims were transported to the city of Semarang for treatment, he said.</p>
<p>Footage shared by the agency showed rescuers moving a victim into a body bag as the nearby bus lay on its side.</p>
<p>Transport accidents are common in Indonesia, a vast Southeast Asian archipelago where vehicles are often old and poorly maintained and road rules regularly flouted.</p>
<p>In 2024, at least 12 people were killed when a car crashed into a bus and another car on a busy highway as people travelled to celebrate Eid al-Fitr.</p>
<p>And in 2019, at least 35 people were killed when a bus plunged into a ravine on the western island of Sumatra.</p>
<img src="https://i1-vnexpress.vnecdn.net/2025/12/17/Sequence0300000000Still001-176-9869-5860-1765945352.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=4z9dh2SYhDHsJ3k6lF7Z-Q" alt="Indian expressway pile-up kills at least 13" />
<p>At least 13 people were killed and around 60 others injured when multiple vehicles crashed on an expressway in India early Tuesday.</p>', 'https://i1-english.vnecdn.net/2025/12/22/image-1766388619-1766388635-8902-1766388639.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=BNAnqeMWJ7FCFCwZsrzV7Q', NULL, 7, 1, NULL, 'draft', false, false, 0, NULL, NULL, NULL, 'english', NULL, NULL, NULL, '2025-12-22 12:47:53.749646', '2025-12-22 12:47:53.749675', true, false, NULL);
INSERT INTO public.news_international VALUES (3, '13th Party Central Committee convenes 15th meeting', '13th-party-central-committee-convenes-15th-meeting', 'The 15th meeting of the 13th Party Central Committee opened in Hanoi on Monday.', '<p>Party General Secretary To Lam presided over and delivered the opening remarks at the meeting. Politburo member, State President Luong Cuong chaired the opening session.

The meeting focuses on reviewing and giving opinions on key preparations to ensure the successful organization of the 14th National Party Congress.

Delegates are about to deliberate three major groups of issues, including personnel work for the 14th National Party Congress; draft documents to be submitted to the Congress; and its essential organization matters, including working regulations and election rules, reports on inspection, supervision and disciplinary work during the 13th tenure, as well as the reports on inspection, supervision and disciplinary work in 2025, and orientations and tasks in 2026.

The Party Central Committee will also consider guidelines for marking key historical milestones, including the summary of 100 years of the leadership of the Communist Party of Vietnam (1930–2030) in association with the Vietnamese revolution, and the review of 40 years of implementing the platform on national construction during the transition to socialism.

Additionally, the meeting will also examine reports on preparations for the 14th National Party Congress and other relevant contents.</p>
<img src="https://i1-english.vnecdn.net/2025/10/06/party-central-committee-175973-5215-9977-1759731408.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=3lbiZgwNxnTj98_g6sX0EQ" alt="Party Central Committee''s 13th plenum discusses preparations for 14th National Party Congress, socio-economic issues" />
<p>The 13th plenum of the 13th Party Central Committee opened in Hanoi on Monday, with discussions focusing on preparations for the 14th National Party Congress and socio-economic issues.</p>', 'https://i1-english.vnecdn.net/2025/12/22/20251222tw15khaimac811767-1766-3237-2581-1766376891.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Fms0Dos9fmTnMODK_qgXFA', NULL, 7, 1, 1, 'published', false, false, 1, NULL, NULL, NULL, 'english', NULL, NULL, '2025-12-22 11:15:11', '2025-12-22 12:48:07.582288', '2025-12-22 12:59:03.65684', true, false, NULL);
INSERT INTO public.news_international VALUES (7, 'Inside Madam Pang''s luxurious beach villa', 'inside-madam-pangs-luxurious-beach-villa', 'The family retreat of Madam Pang overlooks the sea, featuring landscaped gardens and a private swimming pool, designed in a luxurious style.', '<img src="https://i1-ngoisao.vnecdn.net/2025/12/22/panglamsam-1718378395-3390326164291267313-1469911122-1766367679.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=VAuDXhB5fpsALV0lX4XnWA" alt="Inside Madam Pang''s luxurious beach villa" />
<p>Nualphan Lamsam, widely known as Madam Pang, President of the Football Association of Thailand, owns a seaside vacation villa located in Cha-am, Phetchaburi Province, mostly used for family activities. Photos from Instagram/panglamsam</p>
<p>This is her vacation home in addition to a more than 2,000-square-metre mansion in the Sukhumvit area of Bangkok.</p>
<img src="https://i1-ngoisao.vnecdn.net/2025/12/22/panglamsam-1723894936-3436602269968683722-1469911122-1766367533.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=IQcowYu3RzMxz6fwSXTdfA" alt="Inside Madam Pang''s luxurious beach villa" />
<p>The villa, named Ban Chan Tem Duang, makes a strong impression with its predominantly white design, facing directly toward the sea and featuring a private swimming pool.</p>
<img src="https://i1-ngoisao.vnecdn.net/2025/12/22/panglamsam-1723896210-3436612952550541686-1469911122-1766367584.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=G4LdU8m4b_wssfbNCo1k2g" alt="Inside Madam Pang''s luxurious beach villa" />
<p>The relaxation area at the front is fully enclosed with glass, expanding views across the sandy beach and the water.</p>
<img src="https://i1-ngoisao.vnecdn.net/2025/12/22/panglamsam-1723894936-3436602269960368752-1469911122-1766367533.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=zP8PpRj13FJO3kA375Y0Tw" alt="Inside Madam Pang''s luxurious beach villa" />
<p>Although its official value has not been disclosed, many believe Madam Pang’s seaside villa is among the most heavily invested properties, comparable to high-end resorts.</p>
<img src="https://i1-ngoisao.vnecdn.net/2025/12/22/panglamsam-1723896210-3436612952550686951-1469911122-1766367585.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=c9mBsM479Zwumspf1YD6-Q" alt="Inside Madam Pang''s luxurious beach villa" />
<p>The villa’s interior also features a predominantly white palette, with a classic and elegant style.</p>
<img src="https://i1-ngoisao.vnecdn.net/2025/12/22/panglamsam-1723896210-3436612952550540607-1469911122-1766377084.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=6gSCCxGIyyPR-QX329EVrQ" alt="Inside Madam Pang''s luxurious beach villa" />
<p>Most spaces within the villa offer sea views, creating a sense of relaxation and tranquility.</p>
<img src="https://i1-ngoisao.vnecdn.net/2025/12/22/panglamsam-1713152700-3346489856435634816-1469911122-1766376622.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=57R1-ZpNr1h-RRsSzM0jog" alt="Inside Madam Pang''s luxurious beach villa" />
<p>On Instagram, the female tycoon frequently shares everyday moments at the vacation villa.</p>
<img src="https://i1-ngoisao.vnecdn.net/2025/12/22/panglamsam-20240101-155528-41-1766370653.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=3FsZTnInrmKJ5FdxuJOLEg" alt="Inside Madam Pang''s luxurious beach villa" />
<p>Madam Pang has been a familiar figure and has made significant contributions to the development of Thai football over the past decade. She is the 18th president in the history of the Football Association of Thailand and the first woman to hold the role.</p>
<p>She is also among the pioneers who brought international luxury fashion brands to Thailand, including Hermes, Emporio Armani, Tod''s, Rodo, Chloe, Christofle, and Blumarine, making them more accessible to consumers in the country.</p>', 'https://i1-ngoisao.vnecdn.net/2025/12/22/fde3303b-a1a9-40f5-8f0c-f4e38cde-1766376394.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=RFIe-V7gSP2Tkz6xbYuN5Q', NULL, 3, 1, 1, 'published', false, false, 0, NULL, NULL, NULL, 'english', NULL, NULL, '2025-12-22 16:48:59', '2025-12-22 13:00:18.591851', '2025-12-22 13:00:18.591879', true, false, NULL);
INSERT INTO public.news_international VALUES (8, 'Wealthy Indonesian families face tax audits amid high national budget deficit', 'wealthy-indonesian-families-face-tax-audits-amid-high-national-budget-deficit', 'Wealthy families and large companies in Indonesia are facing intensified tax scrutiny from the government before 2025-end amid high national budget deficit.', '<p>Tax authorities have stepped up checks on high-net-worth taxpayers, summoning some to review their filings as part of efforts to shore up collections in what has been a weak year for revenue in Southeast Asia’s largest economy, where projected budget deficit nears the 3% cap of GDP, according to Bloomberg.</p>
<p>Several people familiar with the matter said officials have recently asked large firms controlled by local tycoons to make extra payments in 2025. Some family-owned businesses were told to pay more than US$5 million.</p>
<img src="https://i1-english.vnecdn.net/2025/12/22/AFP-20250612-hikmal-notitle250-9173-9153-1766391975.jpg?w=680&h=0&q=100&dpr=1&fit=crop&s=nTcWDCYTAY3OvSzzgE8h-A" alt="People are in the business district of Jakarta during rush hour in Jakarta, Indonesia, on June 12, 2025. Photo by NurPhoto via AFP" />
<p>When a number of those companies resisted, tax officials suggested they pay 30% of the amount sought as a compromise, without explaining how that figure was determined.</p>
<p>Bimo Wijayanto, director-general of taxes at the Finance Ministry, confirmed that high-wealth taxpayers had been summoned, telling reporters at a Dec. 18 briefing that it was "essentially a routine task of the tax office in order to clarify data."</p>
<p>The ministry’s information, he said, is "increasingly complete," and the summons "give taxpayers the opportunity to provide explanations, voluntarily correct their tax returns and ensure compliance".</p>
<p>It remains unclear how many individuals and businesses have been contacted.</p>
<p>End-of-year efforts to lift tax revenue are relatively common in Indonesia, where critics and business leaders often label the practice "hunting in a zoo," a reference to targeting a small pool of large, formal taxpayers that are easier to monitor, rather than expanding compliance across the vast informal economy of the world’s fourth-most-populous country.</p>
<p>Tax receipts are falling well below targets, with Finance Ministry data showing that collections through end-November stood at 79% of an already reduced full-year goal, compared with nearly 90% over the same period in 2024.</p>
<p>Economists say weak collections, partly due to subdued economic conditions and softer commodity prices, have pushed Indonesia’s closely watched budget deficit forecast to 2.78% of GDP, the highest level in two decades outside the Covid-19 pandemic years.</p>
<img src="https://i1-english.vnecdn.net/2025/10/29/kharlanthonypaicabtfmhu8xwunsp-8276-3350-1761722788.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=gHCqa7OQrWyK9hhCtQdRQA" alt="Which Southeast Asian country projected to be among 10 richest economies in 2026?" />
<p>This Southeast Asian nation has seen its GDP per capita rising by 70% in the last decade, driven by high technology adoption and friendly business climate.</p>
<img src="https://i1-english.vnecdn.net/2025/10/07/afp2025080468nu826v1highresmya-7386-7868-1759829369.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=u-SDtok9rcejrSnmDdMicQ" alt="Which Southeast Asian country has the lowest GDP per capita?" />
<p>The country’s economy has contracted since the Covid-19 pandemic and the political turmoil of 2021, leading to high inflation, rising unemployment, and deepening poverty.</p>
<img src="https://i1-english.vnecdn.net/2025/11/13/dien02-nguyet-nhi-1589101230-1-5163-2439-1763004978.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=XO-thnsH4WLevu-EzBYU6g" alt="National Assembly sets 10% GDP growth target for 2026" />
<p>The National Assembly has set a GDP growth target of 10% for next year, which will take per capita income to US$5,400-5,500.</p>
<img src="https://i1-english.vnecdn.net/2025/12/20/afp-20250114-36tp9lp-v1-highre-7566-6946-1766197867.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=EcLYQe25aRGH-vLClHwtpw" alt="Indonesia to stop rice imports next year" />
<p>Indonesia will not import rice for either consumption or industrial use next year, citing sufficient domestic production, according to a government official.</p>
<img src="https://i1-english.vnecdn.net/2025/12/18/2021-11-12t194656z-840711444-m-6339-3272-1766041529.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=7ZLNM0mfVzDtU9wHknrUzA" alt="Indonesia sends first frozen durian shipment to China" />
<p>Indonesia has directly exported frozen durians to China for the first time with a 48-tonne shipment worth Rp5.1 billion (US$305,000).</p>', 'https://i1-english.vnecdn.net/2025/12/22/afp-20250612-hikmal-notitle250-2870-9548-1766391975.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=DUhZjRPGszssr7spQckC3w', NULL, 7, 1, 1, 'published', false, false, 0, NULL, NULL, NULL, 'english', NULL, NULL, '2025-12-22 16:50:46', '2025-12-22 13:00:27.355587', '2025-12-22 13:00:27.355615', true, false, NULL);
INSERT INTO public.news_international VALUES (9, 'China finds ‘largest’ undersea gold deposit in Asia', 'china-finds-largest-undersea-gold-deposit-in-asia', 'China has found an undersea gold deposit which it claims to be the largest in Asia, following the recent discoveries of other sources of the precious metal this year.', '<p>The discovery, located off the coast of Laizhou in Yantai, Shandong Province, has increased Laizhou’s verified gold reserves to more than 3,900 tonnes (137.57 million ounces), accounting for roughly 26% of China’s total, according to the South China Morning Post.</p>
<p>Officials did not disclose the size of the newly discovered undersea deposit.</p>
<img src="https://i1-english.vnecdn.net/2025/12/22/5d099fc7-f0fb-49c8-aff1-7f6d37-9365-8811-1766393538.jpg?w=680&h=0&q=100&dpr=1&fit=crop&s=nkoz47oGNQ8sjnEsaa9TcQ" alt="Gold bars. Photo by AFP" />
<p>Last month, authorities announced the country’s first super-large, low-grade gold deposit in Liaoning province, with confirmed reserves of 1,444.49 tonnes (50.95 million ounces).</p>
<p>The Ministry of Natural Resources said it was the largest single gold deposit found since the founding of the People’s Republic of China in 1949.</p>
<p>In November, officials also reported the discovery of a gold deposit in the Kunlun Mountains near the western border of the Xinjiang Uygur autonomous region, with estimated reserves of more than 1,000 tonnes (35.27 million ounces).</p>
<p>In November 2023, Shandong Province said it identified about a quarter of the nation’s gold reserves, including more than 3,500 tonnes (123.46 million ounces) on the Jiaodong Peninsula – the world’s third-largest gold mining belt.</p>
<p>China is the world’s largest producer of gold ore, with output reaching 377 tonnes (13.3 million ounces) last year, according to the China Gold Association.</p>
<p>Despite leading global production, the country still lags behind South Africa, Australia and Russia in terms of proven reserves.</p>
<p>China spent CNY115.99 billion (US$16.47 billion) on geological exploration last year. Since the start of the current five-year plan in 2021, total investment in mineral exploration has approached CNY450 billion, leading to the discovery of 150 mineral deposits, according to the Ministry of Natural Resources.</p>
<p>The discoveries come as global gold prices continue to climb, fuelled by currency volatility, geopolitical tensions and heavy buying by central banks, particularly in emerging markets seeking to diversify their reserves.</p>
<p>Spot gold was trading at US$4,407 per ounce at the time of publishing, 68% higher since the beginning of the year.</p>
<img src="https://i1-english.vnecdn.net/2025/12/20/image1-1766203645-1766203655-2302-1766204070.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=oV_Cv3TZqkXARl3zPqTAxA" alt="US uncovers major deposit of rare earths and critical minerals" />
<p>U.S. minerals producer Ionic has discovered a large rare earth and critical metals deposit beneath Utah’s desert that could help cut reliance on foreign supplies for AI, defense, and EVs.</p>
<img src="https://i1-english.vnecdn.net/2025/11/15/20251106t070657z1577919764rc26-9262-5176-1763186095.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=zjb1tXe8mweBNtsy9xh0sQ" alt="China uncovers over 1,400-tonne gold reserve, its largest deposit since 1949" />
<p>China has discovered a gold deposit holding an estimated 1,444 tonnes of reserves worth nearly US$193 billion at current prices, the largest in the country since 1949.</p>
<img src="https://i1-english.vnecdn.net/2025/12/20/HUY2824Goldcoinsforsaleinashop-7834-9999-1766206526.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=JpFjImb7IM5WEXyLeQf0bg" alt="Vietnam gold price increases" />
<p>Vietnam gold price rose Saturday morning as global rates inched up.</p>', 'https://i1-english.vnecdn.net/2025/12/22/5d099fc7-f0fb-49c8-aff1-7f6d37-9851-6746-1766393538.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=x-ANfkjBuvPlhJEgcLoi6Q', NULL, 2, 1, 1, 'published', false, false, 0, NULL, NULL, NULL, 'english', NULL, NULL, '2025-12-22 16:50:08', '2025-12-22 13:00:36.970229', '2025-12-22 13:00:36.970244', true, false, NULL);
INSERT INTO public.news_international VALUES (4, 'Vietnamese migration leads South Korea''s foreign population surge to record high', 'vietnamese-migration-leads-south-koreas-foreign-population-surge-to-record-high', 'South Korea has reached a new demographic milestone with its foreign resident population hitting an all-time high, a trend fueled largely by an influx of young migrants and international students, particularly from Vietnam.', '<p>As of May, the number of foreign residents aged 15 and older stood at approximately 1.69 million, representing an 8.4 % increase compared to the same period last year, according to a survey by the Ministry of Data and Statistics.</p>
<p>This shift comes against the backdrop of a total national population of roughly 51.8 million.</p>
<p>While ethnic Koreans from China continue to comprise the largest foreign resident group at 506,000, Vietnamese nationals have emerged as the fastest-growing demographic. Vietnamese residents now rank second with a population of 270,000, expanding much more rapidly than any other major group.</p>
<p>A major portion of this growth is driven by the education sector, according to the Korea Times.</p>
<p>The overall number of student visa holders rose by 18.2%, or 36,000 people, in just one year. Data highlights the prominence of the Vietnamese community within this sphere, as Vietnam currently ranks first with approximately 100,000 students in South Korea, followed by China with 45,000 and Uzbekistan with 17,000.</p>
<p>The rise in international students, attributed to the global appeal of Korean culture and government initiatives, is reshaping the visa landscape.</p>
<p>While ethnic Korean visas (F-4) and low-skilled worker visas (E-9) still account for the largest raw numbers at 410,000 and 321,000 respectively, professional visa categories are seeing sharp increases. The number of professional workers jumped 25.7% to 82,000, while the population of workers holding permanent residence visas grew by 17.1% to 123,000.</p>
<p>The report also identifies a shifting mindset among these new arrivals, noting a growing preference for long-term settlement over short-term employment.</p>
<p>Among those without permanent residency status, more than 89 % expressed a desire to remain in South Korea. This sentiment is strong among the student population as well, with 65.5 % stating they plan to continue living in the country after graduation, citing high satisfaction with the quality of education and academic programs.</p>
<p>The surge in migration has had a tangible impact on the labor market. More than 1.1 million foreign residents were employed as of May, marking a 9.8% year-on-year rise, the highest employment level recorded since the ministry began collecting such data in 2017, Yonhap reported.</p>
<p>The employment rate among foreign residents reached 65.5%, up 0.8 percentage points from the previous year.</p>
<p>Manufacturing and mining remain the primary sectors for this workforce, absorbing 45% of foreign employees, while the retail, accommodation, and food service industries employ another 20.4%.</p>
<p>Financial incentives appear to be the main draw, with 74.4% of survey respondents citing wages as their primary motivation for working in the country, while just over 9% pointed to the working environment.</p>
<img src="https://i1-english.vnecdn.net/2025/03/05/r64689jpg-1741140294-174114053-7963-6754-1741141316.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=FBkaSJ6idKdQO5d5tAlvIA" alt="S. Korea''s foreign population hits historic high, led by Chinese and Vietnamese" />
<p>The number of foreign residents in South Korea reached a historic milestone last year, exceeding 5% of the total population, with the majority coming from China and Vietnam.</p>
<img src="https://i1-english.vnecdn.net/2025/10/27/img6910jpg-1761549541-17615495-4644-3934-1761549803.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=LD_UfafOuCwxr4BZmuruXg" alt="Vietnam tops global list as South Korea sees record international student numbers" />
<p>South Korea attracted more than 305,000 international students as of August, surpassing its 2027 target, with Vietnamese students leading the influx.</p>
<img src="https://i1-english.vnecdn.net/2025/03/25/download6-1742916091-174291610-2221-1435-1742916137.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=aZ4YLN88WyujQjuSyejnNg" alt="South Korea''s foreign workforce hits record high, but wages lag behind" />
<p>Despite a record-high number of foreign residents in South Korea, nearly two-thirds (63%) of foreign workers earn below the national average monthly salary of ₩3.33 million (US$2,270), according to recent government data.</p>
<img src="https://i1-english.vnecdn.net/2025/11/03/download25-1762144026-17621440-2442-3614-1762144086.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=3GrHdrbxJ1jBjiAflz9aLA" alt="In ageing, lonely South Korea, death becomes a growing business" />
<p>Rows of coffins line a university classroom in the South Korean port city of Busan, ready for use in training the funeral directors of the future in a rapidly ageing country.</p>', 'https://i1-english.vnecdn.net/2025/12/22/img6844jpg-1766373140-17663731-4575-9831-1766373420.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=avNLL1F488GwIq28s3j9iQ', NULL, 2, 1, 1, 'published', false, false, 0, NULL, NULL, NULL, 'english', NULL, NULL, '2025-12-22 13:12:34.835996', '2025-12-22 12:48:19.439861', '2025-12-22 13:12:34.848062', true, false, NULL);
INSERT INTO public.news_international VALUES (1, 'More than 60 hospitalized after suspected banh mi food poisoning in HCMC', 'more-than-60-hospitalized-after-suspected-banh-mi-food-poisoning-in-hcmc', 'More than 60 people were hospitalized in Ho Chi Minh City after suspected food poisoning linked to banh mi bought from a local bakery, authorities said.', '<p>At least 66 people were admitted to hospitals and clinics between Dec. 19 and 21 after experiencing symptoms including severe abdominal pain, vomiting, diarrhea and fever. Many patients required emergency treatment, according to local health officials.</p>
<p>Ba Ria General Hospital confirmed it received dozens of cases on Dec. 22, including several severe patients who are still under medical care. Most patients have since stabilized, with some already discharged.</p>
<p>One patient, Duong Thi Khanh, said she bought six banh mi from Ngoc Ha bakery on the evening of Dec. 19. By the next morning, all six family members had developed severe symptoms and were rushed to hospital. As of Dec. 22, she and her son were still suffering from abdominal pain and diarrhea.</p>
<p>Another patient, Le Thi Thao Vy, said she fell ill later the same day after eating banh mi for breakfast, developing abdominal pain, vomiting, and fever. She was hospitalized after self-medication failed to improve her condition.</p>
<p>Local authorities said all patients shared a common exposure: eating banh mi purchased from Ngoc Ha bakery. The business operates two outlets in Phu My Ward, formerly part of Ba Ria - Vung Tau Province, and sells an estimated 800 loaves per day.</p>
<p>Inspections found the bakery lacked a valid food safety certificate, food safety training documentation and health examination records for staff. Several ingredients, including bread and fresh vegetables, were sourced without purchase contracts, officials said.</p>
<p>Both outlets have been temporarily shut down.</p>
<p>The Phu My Ward administration said it has requested support from Ho Chi Minh City''s food safety authorities to collect samples and determine the exact cause of the suspected poisoning.</p>
<p>The incident comes amid a series of recent food poisoning cases linked to banh mi across Vietnam. In early November, more than 300 people in Ho Chi Minh City were hospitalized due to Salmonella-contaminated pate, while in mid-December, over 200 people in Quang Ngai Province in central Vietnam fell ill after eating banh mi contaminated with Salmonella found in processed meat and vegetables.</p>
<img src="https://i1-english.vnecdn.net/2025/12/15/dieutri176576427042581765764-1-3064-3523-1765777845.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=FTtXx8dEpl8r0Zg4FpcziA" alt="Over 100 hospitalized in central Vietnam after food poisoning linked to popular banh mi chain" />
<p>More than 100 people have been hospitalized or treated after eating banh mi sold by the Hong Van chain in Quang Ngai Province in central Vietnam, prompting an investigation and the temporary shutdown of the business.</p>
<img src="https://i1-english.vnecdn.net/2025/12/13/z73184581080937179cc5dce02e9d3-6344-2431-1765613367.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=_GyDig8kXWtYYAh6rrv1-Q" alt="8 Thai athletes hospitalized over suspected food poisoning at SEA Games" />
<p>Eight Thai athletes at the 33rd SEA Games were hospitalized in Chonburi with symptoms consistent with food poisoning, officials said.</p>
<img src="https://i1-english.vnecdn.net/2025/11/18/taixuong1517430454396361174173-2628-7643-1763435152.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=GSkzWIzX3Mr1CQB5levjDA" alt="Vietnam''s tourism icon banh mi under pressure amid recent scandal of mass food poisoning" />
<p>To many travelers, Vietnam is first discovered through taste rather than landmarks.</p>', 'https://i1-english.vnecdn.net/2025/12/22/ngodocbanhmi17663838808289-176-3116-5543-1766391548.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=wgm8ukwIM1WAfcA9JajY0w', NULL, 6, 1, 1, 'published', false, false, 0, NULL, NULL, NULL, 'english', NULL, NULL, '2025-12-22 13:12:38.209407', '2025-12-22 12:47:34.003793', '2025-12-22 13:12:38.215042', true, false, NULL);
INSERT INTO public.news_international VALUES (6, 'Why returning home remains tough transition for Vietnamese migrant workers', 'why-returning-home-remains-tough-transition-for-vietnamese-migrant-workers', 'Three years ago, Thanh Truc, a 33-year-old woman from southern Vinh Long province, returned to Vietnam after working in Japan with savings of VND200 million (US$7,600). Today, she is preparing to leave again.', '<p>"I just don’t know what to do at home anymore," she said. "I never expected things to be this difficult."</p>
<p>Before leaving Vietnam in 2016, Truc worked as an assistant beautician earning about VND5 million a month. As her parents’ health declined, financial pressure mounted, prompting her to take out a bank loan and apply for Japan’s Technical Intern Training Program.</p>
<p>She was accepted and placed at a component manufacturing factory in Aichi, Japan. By working overtime and benefiting from a strong yen, Truc earned between 150,000 and 160,000 yen (US$954–1,017) per month. After covering living costs, she sent most of her income home and cleared her debts within six months. When her contract ended in late 2019, she returned to Vietnam confident her savings would allow her to renovate her home and open a beauty salon.</p>
<p>Reality proved harsher. She struggled to find work for months, and her cosmetology skills had become outdated during her time in factory work. Techniques, tools and design standards had changed significantly, and refresher courses were costly. Employers also favored younger workers.</p>
<p>As her savings dwindled, Truc moved to Ho Chi Minh City and took a job at a Japanese-owned packaging factory, hoping her language skills would give her an edge. Even with overtime, her monthly income topped out at about VND11 million, far below what she had earned in Japan.</p>
<p>"The work was physically exhausting," she said. "Sometimes I had to carry more than 10 kilograms at once. It’s hard not to feel discouraged when comparing life here to life abroad."</p>
<p>By the end of 2023, still unable to find a sustainable path in Vietnam, Truc quit her job and reapplied for a visa to Japan.</p>
<p>Her experience is far from unique. A report by the Japan International Cooperation Agency shows that only 26.7% of Vietnamese returnees find stable employment after coming home, even when they return with savings of VND300–500 million.</p>
<p>A joint study by the International Labour Organization and the International Organization for Migration found that nearly 44% of returning migrants worldwide face difficulties securing jobs.</p>
<img src="https://i1-giadinh.vnecdn.net/2025/12/12/233A2358-7622-1765555134.jpg?w=680&h=0&q=100&dpr=1&fit=crop&s=FUq_aEY9RV0hgPS9e1U0fA" alt="Công nhân làm việc tại công ty may mặc Dony (xã Vĩnh Lộc A, TP HCM), tháng 8/2025. Ảnh: Quỳnh Trần doanh nghiệp, quần áo, dệt may, người lao động" />
<p>Local surveys also point to high livelihood vulnerability among returnees, highlighting the need for stronger reintegration support.</p>
<p>Labor migration specialist Le Hong Phuong says Vietnamese workers returning from abroad often face three major challenges.</p>
<p>The first is the income and skills gap. Blue-collar workers in Vietnam typically earn VND8–10 million per month, about one-third of what they can make in Japan. Moreover, factory experience overseas rarely translates into the white-collar or skilled jobs many returnees hope for.</p>
<p>The second is psychological pressure. Returnees are often expected to succeed financially and live up to the image of having "made it" abroad, a burden that is heavier in rural areas with limited job opportunities.</p>
<p>The third risk is failed entrepreneurship. Many returnees pour their savings into small businesses or investments without sufficient knowledge, only to see them collapse. Phuong recalled one case in which a worker invested over VND1 billion in an electric vehicle shop that failed quickly, forcing him to return to Japan for manual labor.</p>
<p>Another example is Phan Van Thanh, 30, and his wife. After six years in Japan, the couple returned to Vietnam in mid-2023 with VND400 million, determined to work for themselves. Finding the food and beauty sectors overcrowded, they invested VND100 million in wedding decoration equipment.</p>
<p>"The deeper we got into it, the more overwhelmed we felt," Thanh said. "There was no profit at all."</p>
<p>To offset losses, he bought a car and drove for ride-hailing apps. With their savings nearly gone, the couple considered returning to Japan. Only after a year did the business begin to stabilize, though Thanh said: "Still, compared to my life abroad, things are much tougher."</p>
<p>Phuong advises migrant workers to adopt long-term career planning, ideally five to 10 years ahead, and to acquire skills and certifications that are useful in Vietnam before returning. She also stresses the responsibility of employers and labor agencies to provide transparent information and reintegration support.</p>
<p>Without proper preparation, many returnees are forced to start over from scratch, losing both time and accumulated capital. As a result, an estimated 60–70% of Vietnamese workers eventually choose to go back to Japan.</p>
<p>"Good preparation, mentally and professionally, can make the transition home far less precarious," Phuong said.</p>
<img src="https://i1-english.vnecdn.net/2025/12/02/afp20230615ar202306151117235-1-5092-5050-1764660864.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=_0Nf5O1Y8cGKP9O-9CVIMA" alt="Vietnamese workers suffer highest rate of workplace accidents in Japan amid record surge" />
<p>More than 6,000 foreign workers were injured or killed in workplace accidents in Japan last year, with Vietnamese nationals recording the highest number of casualties at nearly 1,600 cases.</p>
<img src="https://i1-giadinh.vnecdn.net/2025/12/06/z3431522566742-ba18a43f311fb24-2920-1118-1765031930.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=LQ-JtUMeu2UulYV0Picb7A" alt="Fear of returning empty-handed: Vietnamese workers in Japan trapped by expectations" />
<p>In the five years since he moved to Japan, Nhat Tuan 28, has not visited Vietnam even once. His hopes of a "life-changing" journey remain unfulfilled.</p>', 'https://i1-giadinh.vnecdn.net/2025/12/12/233a2358-1765552484-2252-1765555135.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=zoNAPUCtm3FxtiHjzejWbw', NULL, 2, 1, 1, 'published', false, false, 1, NULL, NULL, NULL, 'english', NULL, NULL, '2025-12-22 09:46:19', '2025-12-22 13:00:08.233667', '2025-12-22 14:09:10.979611', true, false, NULL);
INSERT INTO public.news_international VALUES (10, 'Vietnam fruit, vegetable exports to Thailand dip 60%', 'vietnam-fruit-vegetable-exports-to-thailand-dip-60', 'Vietnam’s vegetable and fruit exports to Thailand plummeted by 60% year-on-year to US$105 million in the first 11 months of 2025 even as shipments to other markets jumped.', '<p>There were multiple causes for the decline, one of them being Thailand’s tightened border policy amid its recent conflict with Cambodia, which has disrupted transportation and customs clearance, Dang Phuc Nguyen, secretary general of the Vietnam Fruit and Vegetable Association, said.</p>
<p>It has also been strengthening protection measures, he said.</p>
<p>Thailand used to import Vietnamese frozen durian for re-export to China, but no longer since Vietnam has received permits to export the product directly to China, he added.</p>
<p>The decline dragged Thailand down to ninth place in the list of Vietnam’s export markets from third last year, according to the customs department.</p>
<img src="https://i1-english.vnecdn.net/2025/12/22/screen-shot-2025-12-21-at-7-21-9871-8560-1766376336.jpg?w=680&h=0&q=100&dpr=1&fit=crop&s=aA4i0tMi7YoIGlGOiTH3KA" alt="A durian in Can Tho City. Photo by VnExpress/Manh Khuong" />
<p>But exports to other markets such as Malaysia (77%), the U.S. (56%), the Netherlands (43%), and Australia (28%) rose steeply.</p>
<p>Total exports went up 17% to $7.76 billion, with China remaining the largest market, accounting for 64% of the total value.</p>
<p>Vietnam’s exports to Thailand mainly comprise fresh and frozen fruits such as durian, longan, lychee, dragon fruit, pomelo, rambutan, passion fruit, star apple, custard apple, and coconuts for processing.</p>
<p>In Thailand, they are both consumed domestically and used as inputs for processing and export.</p>
<img src="https://i1-english.vnecdn.net/2025/12/20/1-anh-nguyen-hoang-39-tuoi-go-1949-3192-1766205599.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=dfm7Td2OgRx02kGK7-0zpQ" alt="Vietnam’s trade turnover hits record $920B" />
<p>Vietnam’s total trade turnover is projected to reach a record US$920 billion this year, placing it among the world’s top 15 trading economies.</p>
<img src="https://i1-english.vnecdn.net/2025/12/18/saurienghag1719233173436917192-2093-5180-1766052246.png?w=180&h=108&q=100&dpr=1&fit=crop&s=dLlaCXkWqKwmpw1Y5VOZOw" alt="Laos can now ship fresh durians to China, competing with Southeast Asian peers" />
<p>Laos has gained approval for fresh durian exports to China, joining a host of Southeast Asian suppliers in the race for a share of the world’s largest durian market.</p>
<img src="https://i1-english.vnecdn.net/2025/12/18/2021-11-12t194656z-840711444-m-6339-3272-1766041529.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=7ZLNM0mfVzDtU9wHknrUzA" alt="Indonesia sends first frozen durian shipment to China" />
<p>Indonesia has directly exported frozen durians to China for the first time with a 48-tonne shipment worth Rp5.1 billion (US$305,000).</p>
<img src="https://i1-english.vnecdn.net/2025/12/03/screen-shot-2025-12-03-at-10-2-7855-9047-1764748530.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=G7E8giIa3KqVV_MBs3qI9w" alt="Vietnam durian exports surge to new high" />
<p>Vietnam’s durian exports in the first 10 months of this year rose to a historic US$3.3 billion.</p>', 'https://i1-english.vnecdn.net/2025/12/22/screen-shot-2025-12-21-at-7-21-7188-4651-1766376337.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=ts3bYlBVmh-eNWf4Ha9dmg', NULL, 2, 1, 1, 'published', false, false, 28, NULL, NULL, NULL, 'english', NULL, NULL, '2025-12-22 15:26:04', '2025-12-22 13:00:45.46821', '2025-12-22 14:09:01.792372', true, false, NULL);
INSERT INTO public.news_international VALUES (5, 'Malaysia busts international drug syndicate, seizing $375M worth of narcotics', 'malaysia-busts-international-drug-syndicate-seizing-375m-worth-of-narcotics', 'An international drug syndicate was busted after Malaysian police seized over 18 tonnes of drugs worth nearly US$375 million in one of the country''s biggest drug busts on record.', '<p>Media in Malaysia reported on Dec. 20 that a series of raids in the Klang Valley on Dec. 16 uncovered a massive drug processing lab located in a three-storey bungalow, as well as various other premises used for drug storage.</p>
<p>The seizures included 3 kg of MDMA which is commonly known as ecstasy, four tonnes of cocaine and 14 tonnes of ketamine. Six suspects, including three Malaysian men and three foreign women aged 24 to 39, were arrested.</p>
<p>Director of the Narcotics Crime Investigation Department (NCID) Hussein Omar Khan said one suspect acted as the head storekeeper and assistant to the "chemist", FMT reported. Two others were responsible for managing the residential homes and business premises used as illegal drug laboratories.</p>
<p>The syndicate is believed to have been active since April, using residential homes and business premises to process drugs for the international market.</p>
<img src="https://i1-english.vnecdn.net/2025/12/19/ap25352356813166-1766118049-17-6089-9749-1766118220.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=Gvvk2OZVkIp2Xe4CK6MMoQ" alt="Indonesian court sentences an Australian to 12 years in prison for smuggling cocaine to Bali" />
<p>An Indonesian court on Thursday sentenced an Australian citizen to 12 years in prison after finding him guilty of smuggling cocaine to the tourist island of Bali.</p>
<img src="https://i1-english.vnecdn.net/2025/12/17/p2025121600478-photo-1319928-1-9296-4313-1765945627.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=BfON5L8HI8AqUon-W9r4Jw" alt="Hong Kong customs seize cocaine worth $33M from cargo ship" />
<p>Hong Kong customs has, for the first time, busted a drug smuggling operation that hid narcotics in an underwater compartment of a large cargo vessel, seizing suspected cocaine worth HKD256 million (US$33 million).</p>
<img src="https://i1-english.vnecdn.net/2025/12/09/claudioschwarz3QKK0jg0560unspl-9603-4509-1765263686.jpg?w=180&h=108&q=100&dpr=1&fit=crop&s=VFN37eGrhRlYNVjhg0Sgqw" alt="Singapore enforces tough vaping rules as teens face detention, deportation" />
<p>A 16-year-old Singaporean has become the first etomidate abuser admitted to a Singapore Prison Service drug rehabilitation center and a 15-year-old Myanmar national the first foreigner to lose a long-term visit pass to the city state since enhanced anti-vaping framework took effect.</p>', 'https://i1-english.vnecdn.net/2025/12/22/8859e740d9d84872b3de6391f706-1-3046-2853-1766386162.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=QPr9g926DYvekSyvGp0RgA', NULL, 2, 1, 1, 'published', false, false, 1, NULL, NULL, NULL, 'english', NULL, NULL, '2025-12-22 13:12:31.820756', '2025-12-22 12:48:35.893657', '2025-12-22 14:09:26.893056', true, false, NULL);


--
-- TOC entry 5136 (class 0 OID 16867)
-- Dependencies: 226
-- Data for Name: news_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.news_tags VALUES (1, 1, 1);
INSERT INTO public.news_tags VALUES (2, 1, 3);
INSERT INTO public.news_tags VALUES (3, 2, 6);
INSERT INTO public.news_tags VALUES (4, 2, 7);
INSERT INTO public.news_tags VALUES (5, 3, 8);
INSERT INTO public.news_tags VALUES (6, 4, 10);
INSERT INTO public.news_tags VALUES (7, 5, 12);
INSERT INTO public.news_tags VALUES (8, 6, 13);
INSERT INTO public.news_tags VALUES (9, 6, 14);
INSERT INTO public.news_tags VALUES (10, 7, 2);
INSERT INTO public.news_tags VALUES (11, 7, 3);
INSERT INTO public.news_tags VALUES (12, 8, 3);
INSERT INTO public.news_tags VALUES (13, 9, 9);
INSERT INTO public.news_tags VALUES (14, 10, 11);
INSERT INTO public.news_tags VALUES (30, 14, 6);
INSERT INTO public.news_tags VALUES (42, 15, 26);
INSERT INTO public.news_tags VALUES (43, 15, 27);
INSERT INTO public.news_tags VALUES (46, 16, 28);
INSERT INTO public.news_tags VALUES (47, 16, 29);
INSERT INTO public.news_tags VALUES (50, 17, 28);
INSERT INTO public.news_tags VALUES (51, 17, 29);


--
-- TOC entry 5152 (class 0 OID 17098)
-- Dependencies: 242
-- Data for Name: newsletter_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.newsletter_subscriptions VALUES (1, 'dinhythuc10a9@gmail.com', true, 'XioiiYfWgdDjMQc_O9eFoUAohAGOxfEmbdr3tPR9efk', '2025-12-21 11:18:10.877635', NULL, NULL);
INSERT INTO public.newsletter_subscriptions VALUES (2, 'dinhythuc240594@gmail.com', false, 'vPAvqcYtdMeqFy19tQmmxJPqMwBapY_Cx9B3gnvRZE0', '2025-12-21 11:26:40.815617', '2025-12-21 11:40:46.41787', NULL);


--
-- TOC entry 5154 (class 0 OID 17119)
-- Dependencies: 244
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.password_reset_tokens VALUES (1, 6, '0IvSnScc_PfyTZiyr0T-78A7lpydvkznCPZv5T4j7iA', '2025-12-21 12:28:07.278555', true, '2025-12-21 11:28:07.3207');


--
-- TOC entry 5138 (class 0 OID 16932)
-- Dependencies: 228
-- Data for Name: saved_news; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.saved_news VALUES (2, 6, 2, '2025-12-14 03:19:03.367244', 'vn');
INSERT INTO public.saved_news VALUES (3, 6, 7, '2025-12-21 15:17:10.626047', 'vn');
INSERT INTO public.saved_news VALUES (4, 6, 3, '2025-12-22 13:14:48.464802', 'vn');
INSERT INTO public.saved_news VALUES (14, 6, 10, '2025-12-22 13:54:51.623534', 'en');
INSERT INTO public.saved_news VALUES (15, 6, 6, '2025-12-22 14:09:16.542087', 'en');
INSERT INTO public.saved_news VALUES (16, 6, 5, '2025-12-22 14:09:37.523208', 'en');


--
-- TOC entry 5156 (class 0 OID 17138)
-- Dependencies: 246
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.settings VALUES (1, 'api_token', 'ltOCs9nyjcEBSou1fQqxcaHAM0v7qUuj', NULL, 'api', '2025-12-21 13:58:08.996542', '2025-12-21 13:58:39.73591');
INSERT INTO public.settings VALUES (2, 'api_base_url', 'https://news-api.techreview.pro', NULL, 'api', '2025-12-21 13:58:08.99658', '2025-12-21 13:58:39.744676');
INSERT INTO public.settings VALUES (3, 'smtp_server', 'smtp.gmail.com', NULL, 'smtp', '2025-12-21 13:58:08.996596', '2025-12-21 13:58:39.74845');
INSERT INTO public.settings VALUES (4, 'smtp_port', '587', NULL, 'smtp', '2025-12-21 13:58:08.996611', '2025-12-21 13:58:39.750944');
INSERT INTO public.settings VALUES (5, 'smtp_username', 'dinhythuc10a9@gmail.com', NULL, 'smtp', '2025-12-21 13:58:08.996625', '2025-12-21 13:58:39.754234');
INSERT INTO public.settings VALUES (6, 'smtp_password', 'nqso ngid ijmz dtap', NULL, 'smtp', '2025-12-21 13:58:08.99664', '2025-12-21 13:58:39.759858');
INSERT INTO public.settings VALUES (7, 'smtp_from_email', 'dinhythuc10a9@gmail.com', NULL, 'smtp', '2025-12-21 13:58:08.996652', '2025-12-21 13:58:39.765242');
INSERT INTO public.settings VALUES (8, 'smtp_use_tls', 'true', NULL, 'smtp', '2025-12-21 13:58:08.996664', '2025-12-21 13:58:39.768128');


--
-- TOC entry 5134 (class 0 OID 16855)
-- Dependencies: 224
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.tags VALUES (1, 'iPhone', 'iphone', '2025-12-13 17:33:36.42487');
INSERT INTO public.tags VALUES (2, 'Android', 'android', '2025-12-13 17:33:36.42487');
INSERT INTO public.tags VALUES (3, 'AI', 'ai', '2025-12-13 17:33:36.42487');
INSERT INTO public.tags VALUES (4, 'Blockchain', 'blockchain', '2025-12-13 17:33:36.42487');
INSERT INTO public.tags VALUES (5, 'Startup', 'startup', '2025-12-13 17:33:36.42487');
INSERT INTO public.tags VALUES (6, 'Chứng khoán', 'chung-khoan', '2025-12-13 17:33:36.42487');
INSERT INTO public.tags VALUES (7, 'Bất động sản', 'bat-dong-san', '2025-12-13 17:33:36.42487');
INSERT INTO public.tags VALUES (8, 'World Cup', 'world-cup', '2025-12-13 17:33:36.42487');
INSERT INTO public.tags VALUES (9, 'Premier League', 'premier-league', '2025-12-13 17:33:36.42487');
INSERT INTO public.tags VALUES (10, 'Phim Việt Nam', 'phim-viet-nam', '2025-12-13 17:33:36.42487');
INSERT INTO public.tags VALUES (11, 'Nhạc Việt', 'nhac-viet', '2025-12-13 17:33:36.42487');
INSERT INTO public.tags VALUES (12, 'Đại học', 'dai-hoc', '2025-12-13 17:33:36.42487');
INSERT INTO public.tags VALUES (13, 'Y tế', 'y-te', '2025-12-13 17:33:36.42487');
INSERT INTO public.tags VALUES (14, 'Dinh dưỡng', 'dinh-duong', '2025-12-13 17:33:36.42487');
INSERT INTO public.tags VALUES (25, 'Trong nước', 'trong-nuoc', '2025-12-18 15:07:59.164244');
INSERT INTO public.tags VALUES (26, 'Trong', 'trong', '2025-12-18 15:16:00.226076');
INSERT INTO public.tags VALUES (27, 'nước', 'nuoc', '2025-12-18 15:16:00.261926');
INSERT INTO public.tags VALUES (28, 'Công', 'cong', '2025-12-18 15:33:26.153408');
INSERT INTO public.tags VALUES (29, 'nghệ', 'nghe', '2025-12-18 15:33:26.185693');


--
-- TOC entry 5130 (class 0 OID 16806)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES (3, 'editor2', 'editor2@news.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5', 'Biên tập viên 2', 'editor', true, '2025-12-13 17:33:36.42487', '2025-12-13 17:33:36.42487', NULL, NULL);
INSERT INTO public.users VALUES (4, 'user1', 'user1@news.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5', 'Người dùng 1', 'user', true, '2025-12-13 17:33:36.42487', '2025-12-13 17:33:36.42487', NULL, NULL);
INSERT INTO public.users VALUES (5, 'user2', 'user2@news.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5', 'Người dùng 2', 'user', true, '2025-12-13 17:33:36.42487', '2025-12-13 17:33:36.42487', NULL, NULL);
INSERT INTO public.users VALUES (1, 'admin', 'admin@news.com', 'scrypt:32768:8:1$1LWacKEBH7fGhhYY$8f3f1aa0bb1c1877df77e440d2b42925e7a31fcc22f8234dcf320357808d5011a687e23ae703644fe9de7ec6a0536f42bc4cf5f13c4ca1e40cef8b1592e7f572', 'Quản trị viên', 'admin', true, '2025-12-13 17:33:36.42487', '2025-12-13 17:33:36.42487', NULL, NULL);
INSERT INTO public.users VALUES (2, 'editor', 'editor1@news.com', 'scrypt:32768:8:1$EzGmAJdq91vkgsKh$67f5e268660f7c68b5b2e120a7d6abfee1d1444ce3eca86e04a2c3f692a986c4817c7a78a6e750d45a236950065d724a84d0b21ceea753e7dbed51f4b486d98f', 'Biên tập viên 1', 'editor', true, '2025-12-13 17:33:36.42487', '2025-12-13 17:33:36.42487', NULL, NULL);
INSERT INTO public.users VALUES (6, 'dinhythuc240594', 'dinhythuc240594@gmail.com', 'scrypt:32768:8:1$aQYT7OmCoyojUgLR$4e5c53f8c5a41947fe337c6f4c39ce81f8a164f0c26c3ed8627d6b8f412f197590be3c2ae8c0ccdd7b790977623c35544c18021ef25c0fe0ac2b115c9d9e2c34', 'Đinh Thức', 'user', true, '2025-12-13 15:59:17.151124', '2025-12-21 11:28:50.20545', '0982109103', 'static/uploads/avatars/avatar_6_avatar-de-thuong-33.jpg');
INSERT INTO public.users VALUES (7, 'thuc', 'dinhythuc10a9@gmail.com', 'scrypt:32768:8:1$nBVWRmfxZYRrMq8w$063e58c4631eb5d23925bd208655081e6b0c15ef70a6caa5ef4a0c42b5437d2d95fa6747c9d596a652f2af7c1490a62eebf77ba62c9867e1ca177104909ff78c', 'Thức Đinh', 'editor', true, '2025-12-21 13:28:23.622177', '2025-12-21 13:28:23.622212', '0982109103', NULL);


--
-- TOC entry 5140 (class 0 OID 16949)
-- Dependencies: 230
-- Data for Name: viewed_news; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.viewed_news VALUES (2, 6, 2, '2025-12-14 03:19:01.519166', 'vn');
INSERT INTO public.viewed_news VALUES (3, 2, 15, '2025-12-18 15:20:54.874942', 'vn');
INSERT INTO public.viewed_news VALUES (4, 2, 3, '2025-12-18 15:21:30.103862', 'vn');
INSERT INTO public.viewed_news VALUES (6, 6, 7, '2025-12-21 15:58:34.999048', 'vn');
INSERT INTO public.viewed_news VALUES (5, 1, 3, '2025-12-22 12:59:03.7815', 'vn');
INSERT INTO public.viewed_news VALUES (8, 1, 10, '2025-12-22 13:11:57.78855', 'vn');
INSERT INTO public.viewed_news VALUES (1, 6, 3, '2025-12-22 13:14:45.272905', 'vn');
INSERT INTO public.viewed_news VALUES (7, 6, 10, '2025-12-22 14:09:01.825511', 'vn');
INSERT INTO public.viewed_news VALUES (9, 6, 6, '2025-12-22 14:09:11.018571', 'en');
INSERT INTO public.viewed_news VALUES (10, 6, 5, '2025-12-22 14:09:26.939931', 'en');


--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 217
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 16, true);


--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 239
-- Name: categories_international_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_international_id_seq', 9, true);


--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 231
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 13, true);


--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 235
-- Name: menu_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menu_items_id_seq', 10, true);


--
-- TOC entry 5181 (class 0 OID 0)
-- Dependencies: 233
-- Name: news_api_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.news_api_id_seq', 1, false);


--
-- TOC entry 5182 (class 0 OID 0)
-- Dependencies: 221
-- Name: news_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.news_id_seq', 17, true);


--
-- TOC entry 5183 (class 0 OID 0)
-- Dependencies: 237
-- Name: news_international_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.news_international_id_seq', 10, true);


--
-- TOC entry 5184 (class 0 OID 0)
-- Dependencies: 225
-- Name: news_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.news_tags_id_seq', 51, true);


--
-- TOC entry 5185 (class 0 OID 0)
-- Dependencies: 241
-- Name: newsletter_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.newsletter_subscriptions_id_seq', 2, true);


--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 243
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, true);


--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 227
-- Name: saved_news_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.saved_news_id_seq', 16, true);


--
-- TOC entry 5188 (class 0 OID 0)
-- Dependencies: 245
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 8, true);


--
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 223
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tags_id_seq', 29, true);


--
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- TOC entry 5191 (class 0 OID 0)
-- Dependencies: 229
-- Name: viewed_news_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.viewed_news_id_seq', 10, true);


--
-- TOC entry 4934 (class 2606 OID 17075)
-- Name: categories_international categories_international_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories_international
    ADD CONSTRAINT categories_international_name_key UNIQUE (name);


--
-- TOC entry 4936 (class 2606 OID 17073)
-- Name: categories_international categories_international_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories_international
    ADD CONSTRAINT categories_international_pkey PRIMARY KEY (id);


--
-- TOC entry 4938 (class 2606 OID 17077)
-- Name: categories_international categories_international_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories_international
    ADD CONSTRAINT categories_international_slug_key UNIQUE (slug);


--
-- TOC entry 4880 (class 2606 OID 16797)
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- TOC entry 4882 (class 2606 OID 16795)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4884 (class 2606 OID 16799)
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- TOC entry 4919 (class 2606 OID 16973)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- TOC entry 4926 (class 2606 OID 17016)
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4928 (class 2606 OID 17018)
-- Name: menu_items menu_items_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_slug_key UNIQUE (slug);


--
-- TOC entry 4924 (class 2606 OID 17004)
-- Name: news_api news_api_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_api
    ADD CONSTRAINT news_api_pkey PRIMARY KEY (id);


--
-- TOC entry 4930 (class 2606 OID 17041)
-- Name: news_international news_international_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_international
    ADD CONSTRAINT news_international_pkey PRIMARY KEY (id);


--
-- TOC entry 4932 (class 2606 OID 17043)
-- Name: news_international news_international_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_international
    ADD CONSTRAINT news_international_slug_key UNIQUE (slug);


--
-- TOC entry 4897 (class 2606 OID 16836)
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- TOC entry 4899 (class 2606 OID 16838)
-- Name: news news_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_slug_key UNIQUE (slug);


--
-- TOC entry 4907 (class 2606 OID 16874)
-- Name: news_tags news_tags_news_id_tag_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_tags
    ADD CONSTRAINT news_tags_news_id_tag_id_key UNIQUE (news_id, tag_id);


--
-- TOC entry 4909 (class 2606 OID 16872)
-- Name: news_tags news_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_tags
    ADD CONSTRAINT news_tags_pkey PRIMARY KEY (id);


--
-- TOC entry 4943 (class 2606 OID 17107)
-- Name: newsletter_subscriptions newsletter_subscriptions_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_subscriptions
    ADD CONSTRAINT newsletter_subscriptions_email_key UNIQUE (email);


--
-- TOC entry 4945 (class 2606 OID 17105)
-- Name: newsletter_subscriptions newsletter_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_subscriptions
    ADD CONSTRAINT newsletter_subscriptions_pkey PRIMARY KEY (id);


--
-- TOC entry 4947 (class 2606 OID 17109)
-- Name: newsletter_subscriptions newsletter_subscriptions_unsubscribe_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_subscriptions
    ADD CONSTRAINT newsletter_subscriptions_unsubscribe_token_key UNIQUE (unsubscribe_token);


--
-- TOC entry 4952 (class 2606 OID 17126)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4954 (class 2606 OID 17128)
-- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- TOC entry 4913 (class 2606 OID 16937)
-- Name: saved_news saved_news_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_news
    ADD CONSTRAINT saved_news_pkey PRIMARY KEY (id);


--
-- TOC entry 4958 (class 2606 OID 17147)
-- Name: settings settings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- TOC entry 4960 (class 2606 OID 17145)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4901 (class 2606 OID 16863)
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- TOC entry 4903 (class 2606 OID 16861)
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- TOC entry 4905 (class 2606 OID 16865)
-- Name: tags tags_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_slug_key UNIQUE (slug);


--
-- TOC entry 4886 (class 2606 OID 16821)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4888 (class 2606 OID 16817)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4890 (class 2606 OID 16819)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4917 (class 2606 OID 16954)
-- Name: viewed_news viewed_news_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.viewed_news
    ADD CONSTRAINT viewed_news_pkey PRIMARY KEY (id);


--
-- TOC entry 4920 (class 1259 OID 16994)
-- Name: idx_comments_news; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_news ON public.comments USING btree (news_id);


--
-- TOC entry 4921 (class 1259 OID 16995)
-- Name: idx_comments_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_parent ON public.comments USING btree (parent_id);


--
-- TOC entry 4922 (class 1259 OID 16993)
-- Name: idx_comments_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_user ON public.comments USING btree (user_id);


--
-- TOC entry 4891 (class 1259 OID 16886)
-- Name: idx_news_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_news_category ON public.news USING btree (category_id);


--
-- TOC entry 4892 (class 1259 OID 16887)
-- Name: idx_news_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_news_created_at ON public.news USING btree (created_at DESC);


--
-- TOC entry 4893 (class 1259 OID 16889)
-- Name: idx_news_published_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_news_published_at ON public.news USING btree (published_at DESC);


--
-- TOC entry 4894 (class 1259 OID 16888)
-- Name: idx_news_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_news_slug ON public.news USING btree (slug);


--
-- TOC entry 4895 (class 1259 OID 16885)
-- Name: idx_news_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_news_status ON public.news USING btree (status);


--
-- TOC entry 4939 (class 1259 OID 17115)
-- Name: idx_newsletter_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_newsletter_email ON public.newsletter_subscriptions USING btree (email);


--
-- TOC entry 4940 (class 1259 OID 17116)
-- Name: idx_newsletter_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_newsletter_token ON public.newsletter_subscriptions USING btree (unsubscribe_token);


--
-- TOC entry 4941 (class 1259 OID 17117)
-- Name: idx_newsletter_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_newsletter_user ON public.newsletter_subscriptions USING btree (user_id);


--
-- TOC entry 4948 (class 1259 OID 17136)
-- Name: idx_reset_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reset_expires ON public.password_reset_tokens USING btree (expires_at);


--
-- TOC entry 4949 (class 1259 OID 17134)
-- Name: idx_reset_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reset_token ON public.password_reset_tokens USING btree (token);


--
-- TOC entry 4950 (class 1259 OID 17135)
-- Name: idx_reset_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reset_user ON public.password_reset_tokens USING btree (user_id);


--
-- TOC entry 4910 (class 1259 OID 16990)
-- Name: idx_saved_news_news; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_saved_news_news ON public.saved_news USING btree (news_id);


--
-- TOC entry 4911 (class 1259 OID 16989)
-- Name: idx_saved_news_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_saved_news_user ON public.saved_news USING btree (user_id);


--
-- TOC entry 4955 (class 1259 OID 17149)
-- Name: idx_settings_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settings_category ON public.settings USING btree (category);


--
-- TOC entry 4956 (class 1259 OID 17148)
-- Name: idx_settings_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settings_key ON public.settings USING btree (key);


--
-- TOC entry 4914 (class 1259 OID 16992)
-- Name: idx_viewed_news_news; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_viewed_news_news ON public.viewed_news USING btree (news_id);


--
-- TOC entry 4915 (class 1259 OID 16991)
-- Name: idx_viewed_news_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_viewed_news_user ON public.viewed_news USING btree (user_id);


--
-- TOC entry 4979 (class 2606 OID 17078)
-- Name: categories_international categories_international_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories_international
    ADD CONSTRAINT categories_international_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id);


--
-- TOC entry 4961 (class 2606 OID 16800)
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id);


--
-- TOC entry 4971 (class 2606 OID 16979)
-- Name: comments comments_news_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_news_id_fkey FOREIGN KEY (news_id) REFERENCES public.news(id);


--
-- TOC entry 4972 (class 2606 OID 16984)
-- Name: comments comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id);


--
-- TOC entry 4973 (class 2606 OID 16974)
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4975 (class 2606 OID 17019)
-- Name: menu_items menu_items_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.menu_items(id);


--
-- TOC entry 4974 (class 2606 OID 17005)
-- Name: news_api news_api_news_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_api
    ADD CONSTRAINT news_api_news_id_fkey FOREIGN KEY (news_id) REFERENCES public.news(id);


--
-- TOC entry 4962 (class 2606 OID 16849)
-- Name: news news_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- TOC entry 4963 (class 2606 OID 16839)
-- Name: news news_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- TOC entry 4964 (class 2606 OID 16844)
-- Name: news news_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4976 (class 2606 OID 17054)
-- Name: news_international news_international_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_international
    ADD CONSTRAINT news_international_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- TOC entry 4977 (class 2606 OID 17044)
-- Name: news_international news_international_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_international
    ADD CONSTRAINT news_international_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- TOC entry 4978 (class 2606 OID 17049)
-- Name: news_international news_international_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_international
    ADD CONSTRAINT news_international_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4965 (class 2606 OID 16875)
-- Name: news_tags news_tags_news_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_tags
    ADD CONSTRAINT news_tags_news_id_fkey FOREIGN KEY (news_id) REFERENCES public.news(id) ON DELETE CASCADE;


--
-- TOC entry 4966 (class 2606 OID 16880)
-- Name: news_tags news_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news_tags
    ADD CONSTRAINT news_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- TOC entry 4980 (class 2606 OID 17110)
-- Name: newsletter_subscriptions newsletter_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_subscriptions
    ADD CONSTRAINT newsletter_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4981 (class 2606 OID 17129)
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4967 (class 2606 OID 16943)
-- Name: saved_news saved_news_news_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_news
    ADD CONSTRAINT saved_news_news_id_fkey FOREIGN KEY (news_id) REFERENCES public.news(id);


--
-- TOC entry 4968 (class 2606 OID 16938)
-- Name: saved_news saved_news_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_news
    ADD CONSTRAINT saved_news_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4969 (class 2606 OID 16960)
-- Name: viewed_news viewed_news_news_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.viewed_news
    ADD CONSTRAINT viewed_news_news_id_fkey FOREIGN KEY (news_id) REFERENCES public.news(id);


--
-- TOC entry 4970 (class 2606 OID 16955)
-- Name: viewed_news viewed_news_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.viewed_news
    ADD CONSTRAINT viewed_news_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Completed on 2025-12-22 21:32:28

--
-- PostgreSQL database dump complete
--

\unrestrict dUybFtauBpxmrm2nNEMo8r1cmlYp9EHHe1lrDNKcdTq4fBDaDeoM2vURKqLRHse

