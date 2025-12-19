--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.5

-- Started on 2025-10-28 08:01:25

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
-- TOC entry 5 (class 2615 OID 24928)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 4978 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 24939)
-- Name: Customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Customer" (
    id integer NOT NULL,
    name text NOT NULL,
    "fatherName" text NOT NULL,
    "contactNo" character varying(20),
    "altContactNo" character varying(20),
    "aadharNo" text,
    address text,
    city text,
    occupation text,
    "profileImageUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Customer" OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 24938)
-- Name: Customer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Customer_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Customer_id_seq" OWNER TO postgres;

--
-- TOC entry 4980 (class 0 OID 0)
-- Dependencies: 218
-- Name: Customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Customer_id_seq" OWNED BY public."Customer".id;


--
-- TOC entry 227 (class 1259 OID 24981)
-- Name: Guarantor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Guarantor" (
    id integer NOT NULL,
    name text NOT NULL,
    "relationToBorrower" text,
    phone character varying(20),
    address text,
    city text,
    occupation text,
    "idProofType" text,
    "idProofNumber" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Guarantor" OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 24980)
-- Name: Guarantor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Guarantor_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Guarantor_id_seq" OWNER TO postgres;

--
-- TOC entry 4981 (class 0 OID 0)
-- Dependencies: 226
-- Name: Guarantor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Guarantor_id_seq" OWNED BY public."Guarantor".id;


--
-- TOC entry 223 (class 1259 OID 24961)
-- Name: Installment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Installment" (
    id integer NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "emiAmount" numeric(10,2) NOT NULL,
    amount numeric(10,2) NOT NULL,
    balance numeric(10,2) NOT NULL,
    status text NOT NULL,
    "loanId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "srNo" integer NOT NULL
);


ALTER TABLE public."Installment" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 24960)
-- Name: Installment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Installment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Installment_id_seq" OWNER TO postgres;

--
-- TOC entry 4982 (class 0 OID 0)
-- Dependencies: 222
-- Name: Installment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Installment_id_seq" OWNED BY public."Installment".id;


--
-- TOC entry 221 (class 1259 OID 24950)
-- Name: Loan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Loan" (
    id integer NOT NULL,
    "loanNumber" text NOT NULL,
    "loanDate" timestamp(3) without time zone NOT NULL,
    "loanType" text NOT NULL,
    status text NOT NULL,
    "loanAmount" numeric(10,2) NOT NULL,
    "disbursedAmount" numeric(10,2),
    "interestRate" numeric(5,2),
    "interestAmount" numeric(10,2),
    "totalAmount" numeric(10,2),
    "emiAmount" numeric(10,2),
    "totalEmi" integer,
    "emiPaid" integer DEFAULT 0 NOT NULL,
    balance numeric(10,2),
    tenure integer,
    "installmentFrequency" text,
    "customerId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Loan" OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 24991)
-- Name: LoanGuarantor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LoanGuarantor" (
    id integer NOT NULL,
    "loanId" integer NOT NULL,
    "guarantorId" integer NOT NULL,
    role text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LoanGuarantor" OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 24990)
-- Name: LoanGuarantor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."LoanGuarantor_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."LoanGuarantor_id_seq" OWNER TO postgres;

--
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 228
-- Name: LoanGuarantor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."LoanGuarantor_id_seq" OWNED BY public."LoanGuarantor".id;


--
-- TOC entry 220 (class 1259 OID 24949)
-- Name: Loan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Loan_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Loan_id_seq" OWNER TO postgres;

--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 220
-- Name: Loan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Loan_id_seq" OWNED BY public."Loan".id;


--
-- TOC entry 225 (class 1259 OID 24971)
-- Name: Transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transaction" (
    id integer NOT NULL,
    code text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    amount numeric(10,2) NOT NULL,
    type text NOT NULL,
    "loanId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Transaction" OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 24970)
-- Name: Transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Transaction_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Transaction_id_seq" OWNER TO postgres;

--
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 224
-- Name: Transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Transaction_id_seq" OWNED BY public."Transaction".id;


--
-- TOC entry 217 (class 1259 OID 24929)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 4773 (class 2604 OID 24942)
-- Name: Customer id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Customer" ALTER COLUMN id SET DEFAULT nextval('public."Customer_id_seq"'::regclass);


--
-- TOC entry 4782 (class 2604 OID 24984)
-- Name: Guarantor id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Guarantor" ALTER COLUMN id SET DEFAULT nextval('public."Guarantor_id_seq"'::regclass);


--
-- TOC entry 4778 (class 2604 OID 24964)
-- Name: Installment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Installment" ALTER COLUMN id SET DEFAULT nextval('public."Installment_id_seq"'::regclass);


--
-- TOC entry 4775 (class 2604 OID 24953)
-- Name: Loan id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Loan" ALTER COLUMN id SET DEFAULT nextval('public."Loan_id_seq"'::regclass);


--
-- TOC entry 4784 (class 2604 OID 24994)
-- Name: LoanGuarantor id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LoanGuarantor" ALTER COLUMN id SET DEFAULT nextval('public."LoanGuarantor_id_seq"'::regclass);


--
-- TOC entry 4780 (class 2604 OID 24974)
-- Name: Transaction id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction" ALTER COLUMN id SET DEFAULT nextval('public."Transaction_id_seq"'::regclass);


--
-- TOC entry 4962 (class 0 OID 24939)
-- Dependencies: 219
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Customer" (id, name, "fatherName", "contactNo", "altContactNo", "aadharNo", address, city, occupation, "profileImageUrl", "createdAt", "updatedAt") FROM stdin;
1	Harry Potter	James Potter	9876543210	\N	1234-5678-9012	\N	London	Auror	https://res.cloudinary.com/dngxkzx4g/image/upload/v1759661506/etzqmeia2ia5ccyz9nhw.jpg	2025-10-05 10:51:45.523	2025-10-05 10:51:45.523
2	Legolas	Thranduil	9812345678	\N	2345-6789-0123	\N	Mirkwood	Archer	https://res.cloudinary.com/dngxkzx4g/image/upload/v1759661715/vjhccvk2cucdmpg8eebo.png	2025-10-05 10:55:13.987	2025-10-05 10:55:13.987
3	iron man	tony stark	9000000001	\N	3456-7890-1234	\N	Mirkwood	Berk	https://res.cloudinary.com/dngxkzx4g/image/upload/v1759661815/c934g181zy77sxfugcag.jpg	2025-10-05 10:56:54.423	2025-10-05 10:56:54.423
4	hermione	mr. granger	9000000001	\N	4567-8901-2345	\N	Oxford	Researcher	https://res.cloudinary.com/dngxkzx4g/image/upload/v1759661916/ipbg2sbkqcful3o3v9vw.jpg	2025-10-05 10:58:35.398	2025-10-05 10:58:35.398
5	count dracula	vlad 2	9998887776	\N	5678-9012-3456	\N	translyvinia	night rader	https://res.cloudinary.com/dngxkzx4g/image/upload/v1759662028/knraue9yqni5gavtznch.jpg	2025-10-05 11:00:27.879	2025-10-05 11:00:27.879
\.


--
-- TOC entry 4970 (class 0 OID 24981)
-- Dependencies: 227
-- Data for Name: Guarantor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Guarantor" (id, name, "relationToBorrower", phone, address, city, occupation, "idProofType", "idProofNumber", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 4966 (class 0 OID 24961)
-- Dependencies: 223
-- Data for Name: Installment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Installment" (id, "dueDate", "emiAmount", amount, balance, status, "loanId", "createdAt", "updatedAt", "srNo") FROM stdin;
\.


--
-- TOC entry 4964 (class 0 OID 24950)
-- Dependencies: 221
-- Data for Name: Loan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Loan" (id, "loanNumber", "loanDate", "loanType", status, "loanAmount", "disbursedAmount", "interestRate", "interestAmount", "totalAmount", "emiAmount", "totalEmi", "emiPaid", balance, tenure, "installmentFrequency", "customerId", "createdAt", "updatedAt") FROM stdin;
1	HP001	2025-09-01 00:00:00	Magic Business	Active	50000.00	50000.00	5.50	2750.00	52750.00	4395.83	12	0	\N	12	Monthly	1	2025-10-05 10:51:45.523	2025-10-05 10:51:45.523
2	LG002	2025-08-15 00:00:00	Forest Trade	Active	30000.00	30000.00	6.00	1800.00	31800.00	2650.00	12	0	\N	12	Monthly	2	2025-10-05 10:55:13.987	2025-10-05 10:55:13.987
3	TT003	2025-07-10 00:00:00	Flight Gear	Active	20000.00	20000.00	4.50	900.00	20900.00	1741.67	12	0	\N	12	Monthly	3	2025-10-05 10:56:54.423	2025-10-05 10:56:54.423
4	HG004	2025-06-20 00:00:00	Library Expansion	Active	40000.00	40000.00	5.00	2000.00	42000.00	3500.00	12	0	\N	12	Monthly	4	2025-10-05 10:58:35.398	2025-10-05 10:58:35.398
5	CD005	2025-05-05 00:00:00	Castle Renovation	Active	60000.00	60000.00	6.50	3900.00	63900.00	5325.00	12	0	\N	12	Monthly	5	2025-10-05 11:00:27.879	2025-10-05 11:00:27.879
\.


--
-- TOC entry 4972 (class 0 OID 24991)
-- Dependencies: 229
-- Data for Name: LoanGuarantor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LoanGuarantor" (id, "loanId", "guarantorId", role, "createdAt") FROM stdin;
\.


--
-- TOC entry 4968 (class 0 OID 24971)
-- Dependencies: 225
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Transaction" (id, code, date, amount, type, "loanId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 4960 (class 0 OID 24929)
-- Dependencies: 217
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
80e0eac0-3158-45f2-8999-f1ef7229d020	3ea16a512dcc444c85276a4d3ac617dcc4c7aa0a19058536807d92e1d0e27d9f	2025-10-05 15:35:41.349046+05:30	20250916233642_init_schema	\N	\N	2025-10-05 15:35:41.119303+05:30	1
6c029006-1bdd-4513-aab1-04c04ca88b0f	20e5364efb0fc789b41870b81b44e1c33f340e760927b5b6884a19aac860421c	2025-10-05 15:35:41.355416+05:30	20250917003658_init_schema	\N	\N	2025-10-05 15:35:41.350314+05:30	1
\.


--
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 218
-- Name: Customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Customer_id_seq"', 5, true);


--
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 226
-- Name: Guarantor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Guarantor_id_seq"', 1, false);


--
-- TOC entry 4988 (class 0 OID 0)
-- Dependencies: 222
-- Name: Installment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Installment_id_seq"', 1, false);


--
-- TOC entry 4989 (class 0 OID 0)
-- Dependencies: 228
-- Name: LoanGuarantor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."LoanGuarantor_id_seq"', 1, false);


--
-- TOC entry 4990 (class 0 OID 0)
-- Dependencies: 220
-- Name: Loan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Loan_id_seq"', 5, true);


--
-- TOC entry 4991 (class 0 OID 0)
-- Dependencies: 224
-- Name: Transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Transaction_id_seq"', 1, false);


--
-- TOC entry 4791 (class 2606 OID 24948)
-- Name: Customer Customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_pkey" PRIMARY KEY (id);


--
-- TOC entry 4804 (class 2606 OID 24989)
-- Name: Guarantor Guarantor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Guarantor"
    ADD CONSTRAINT "Guarantor_pkey" PRIMARY KEY (id);


--
-- TOC entry 4797 (class 2606 OID 24969)
-- Name: Installment Installment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Installment"
    ADD CONSTRAINT "Installment_pkey" PRIMARY KEY (id);


--
-- TOC entry 4809 (class 2606 OID 24999)
-- Name: LoanGuarantor LoanGuarantor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LoanGuarantor"
    ADD CONSTRAINT "LoanGuarantor_pkey" PRIMARY KEY (id);


--
-- TOC entry 4794 (class 2606 OID 24959)
-- Name: Loan Loan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Loan"
    ADD CONSTRAINT "Loan_pkey" PRIMARY KEY (id);


--
-- TOC entry 4800 (class 2606 OID 24979)
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- TOC entry 4787 (class 2606 OID 24937)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4788 (class 1259 OID 25000)
-- Name: Customer_aadharNo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Customer_aadharNo_key" ON public."Customer" USING btree ("aadharNo");


--
-- TOC entry 4789 (class 1259 OID 25001)
-- Name: Customer_contactNo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Customer_contactNo_idx" ON public."Customer" USING btree ("contactNo");


--
-- TOC entry 4801 (class 1259 OID 25005)
-- Name: Guarantor_idProofNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Guarantor_idProofNumber_key" ON public."Guarantor" USING btree ("idProofNumber");


--
-- TOC entry 4802 (class 1259 OID 25006)
-- Name: Guarantor_name_phone_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Guarantor_name_phone_idx" ON public."Guarantor" USING btree (name, phone);


--
-- TOC entry 4795 (class 1259 OID 25036)
-- Name: Installment_loanId_srNo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Installment_loanId_srNo_idx" ON public."Installment" USING btree ("loanId", "srNo");


--
-- TOC entry 4805 (class 1259 OID 25007)
-- Name: LoanGuarantor_guarantorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LoanGuarantor_guarantorId_idx" ON public."LoanGuarantor" USING btree ("guarantorId");


--
-- TOC entry 4806 (class 1259 OID 25009)
-- Name: LoanGuarantor_loanId_guarantorId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "LoanGuarantor_loanId_guarantorId_key" ON public."LoanGuarantor" USING btree ("loanId", "guarantorId");


--
-- TOC entry 4807 (class 1259 OID 25008)
-- Name: LoanGuarantor_loanId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LoanGuarantor_loanId_idx" ON public."LoanGuarantor" USING btree ("loanId");


--
-- TOC entry 4792 (class 1259 OID 25002)
-- Name: Loan_loanNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Loan_loanNumber_key" ON public."Loan" USING btree ("loanNumber");


--
-- TOC entry 4798 (class 1259 OID 25004)
-- Name: Transaction_loanId_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Transaction_loanId_date_idx" ON public."Transaction" USING btree ("loanId", date);


--
-- TOC entry 4811 (class 2606 OID 25015)
-- Name: Installment Installment_loanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Installment"
    ADD CONSTRAINT "Installment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES public."Loan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4813 (class 2606 OID 25030)
-- Name: LoanGuarantor LoanGuarantor_guarantorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LoanGuarantor"
    ADD CONSTRAINT "LoanGuarantor_guarantorId_fkey" FOREIGN KEY ("guarantorId") REFERENCES public."Guarantor"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4814 (class 2606 OID 25025)
-- Name: LoanGuarantor LoanGuarantor_loanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LoanGuarantor"
    ADD CONSTRAINT "LoanGuarantor_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES public."Loan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4810 (class 2606 OID 25010)
-- Name: Loan Loan_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Loan"
    ADD CONSTRAINT "Loan_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4812 (class 2606 OID 25020)
-- Name: Transaction Transaction_loanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES public."Loan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4979 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2025-10-28 08:01:27

--
-- PostgreSQL database dump complete
--

