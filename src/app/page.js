'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration:.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const fadeInFromLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, type: "spring", stiffness: 50 }
  }
};

const fadeInFromRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, type: "spring", stiffness: 50 }
  }
};

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        className="bg-card shadow-sm border-b sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 50 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <motion.span 
                  className="text-xl font-bold text-primary"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  TrackPro
                </motion.span>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link href="/" className="border-b-2 border-primary text-foreground inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Home
                </Link>
                <Link href="/features" className="border-transparent text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-primary/50 transition-all inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Features
                </Link>
                <Link href="/pricing" className="border-transparent text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-primary/50 transition-all inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Pricing
                </Link>
                <Link href="/about" className="border-transparent text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-primary/50 transition-all inline-flex items-center px-1 pt-1 text-sm font-medium">
                  About
                </Link>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" asChild className="hover:bg-primary/10">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="relative overflow-hidden group">
                <Link href="/signup">
                  <span className="relative z-10">Sign Up</span>
                  <motion.span 
                    className="absolute inset-0 bg-primary-foreground/10" 
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                  />
                </Link>
              </Button>
            </div>
            <div className="-mr-2 flex items-center md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-1 pt-2 pb-3">
              <Link href="/" className="bg-primary/10 block pl-3 pr-4 py-2 border-l-4 border-primary text-base font-medium">
                Home
              </Link>
              <Link href="/features" className="border-transparent hover:bg-accent hover:text-accent-foreground block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200">
                Features
              </Link>
              <Link href="/pricing" className="border-transparent hover:bg-accent hover:text-accent-foreground block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200">
                Pricing
              </Link>
              <Link href="/about" className="border-transparent hover:bg-accent hover:text-accent-foreground block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200">
                About
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-border">
              <div className="flex items-center px-4 space-x-3">
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="w-full justify-start">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <div className="relative bg-background py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Text */}
            <motion.div 
              className="text-center lg:text-left"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h1 
                className="text-4xl tracking-tight font-extrabold text-foreground sm:text-5xl md:text-6xl"
                variants={fadeInFromLeft}
              >
                <span className="block">Maximize Productivity</span>
                <span className="block text-primary">Track With Confidence</span>
              </motion.h1>
              <motion.p 
                className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto lg:mx-0 md:mt-5 md:text-xl"
                variants={fadeInFromLeft}
              >
                TrackPro helps you monitor employee productivity, attendance, and performance with powerful analytics and intuitive dashboards.
              </motion.p>
              <motion.div 
                className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
                variants={fadeIn}
              >
                <Button size="lg" asChild className="shadow-lg hover:shadow-primary/20 transition-all duration-300">
                  <a href="/demo">
                    Get Started
                    <motion.svg 
                      className="ml-2 h-4 w-4" 
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </motion.svg>
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild className="mt-3 sm:mt-0 sm:ml-3 border-primary/20 hover:border-primary/50">
                  <a href="/learn-more">Learn More</a>
                </Button>
              </motion.div>
            </motion.div>

            {/* Right column - Image */}
            <motion.div 
              className="flex items-center justify-center lg:justify-end"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInFromRight}
            >
              <motion.div
                className="relative rounded-lg shadow-xl overflow-hidden w-full h-auto"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Team working in office"
                  className="w-full h-auto object-cover rounded-lg shadow-lg"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <motion.div 
        className="py-16 bg-muted"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <motion.h2 
              className="text-base text-primary font-semibold tracking-wide uppercase"
              variants={fadeIn}
            >
              Features
            </motion.h2>
            <motion.p 
              className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-foreground sm:text-4xl"
              variants={fadeIn}
            >
              Everything you need to manage your team
            </motion.p>
            <motion.p 
              className="mt-4 max-w-2xl text-xl text-muted-foreground lg:mx-auto"
              variants={fadeIn}
            >
              Our comprehensive employee monitoring system provides all the tools you need for effective workforce management.
            </motion.p>
          </div>

          <div className="mt-10">
            <motion.div 
              className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {/* Feature 1 */}
              <motion.div 
                className="relative bg-card p-8 rounded-xl shadow-sm border overflow-hidden group"
                variants={fadeIn}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="absolute bottom-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mb-16"
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  whileHover={{ scale: 1, opacity: 0.8 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="relative">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="mt-5">
                    <h3 className="text-lg leading-6 font-medium text-foreground">Real-time Tracking</h3>
                    <p className="mt-2 text-base text-muted-foreground">
                      Monitor employee activity in real-time with our powerful dashboard and analytics tools.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Feature 2 */}
              <motion.div 
                className="relative bg-card p-8 rounded-xl shadow-sm border overflow-hidden group"
                variants={fadeIn}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="absolute bottom-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mb-16"
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  whileHover={{ scale: 1, opacity: 0.8 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="relative">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="mt-5">
                    <h3 className="text-lg leading-6 font-medium text-foreground">Productivity Analytics</h3>
                    <p className="mt-2 text-base text-muted-foreground">
                      Measure and analyze productivity metrics to identify trends and opportunities for improvement.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Feature 3 */}
              <motion.div 
                className="relative bg-card p-8 rounded-xl shadow-sm border overflow-hidden group"
                variants={fadeIn}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="absolute bottom-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mb-16"
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  whileHover={{ scale: 1, opacity: 0.8 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="relative">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="mt-5">
                    <h3 className="text-lg leading-6 font-medium text-foreground">Attendance Management</h3>
                    <p className="mt-2 text-base text-muted-foreground">
                      Track attendance, time-off, and work hours with automated reporting and notifications.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Feature 4 */}
              <motion.div 
                className="relative bg-card p-8 rounded-xl shadow-sm border overflow-hidden group"
                variants={fadeIn}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="absolute bottom-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mb-16"
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  whileHover={{ scale: 1, opacity: 0.8 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="relative">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="mt-5">
                    <h3 className="text-lg leading-6 font-medium text-foreground">Performance Reporting</h3>
                    <p className="mt-2 text-base text-muted-foreground">
                      Generate detailed performance reports with customizable metrics and visualizations.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Testimonials */}
      <motion.div 
        className="bg-background py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-10">
            <motion.h2 
              className="text-base text-primary font-semibold tracking-wide uppercase"
              variants={fadeIn}
            >
              Testimonials
            </motion.h2>
            <motion.p 
              className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-foreground sm:text-4xl"
              variants={fadeIn}
            >
              Trusted by companies worldwide
            </motion.p>
          </div>
          <motion.div 
            className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Testimonial 1 */}
            <motion.div 
              className="bg-card p-6 rounded-xl shadow-md border hover:shadow-xl transition-shadow duration-300"
              variants={fadeIn}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 relative rounded-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                    alt="Profile"
                    className="rounded-full object-cover h-full w-full"
                    width={48}
                    height={48}
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-foreground">John Smith</h4>
                  <p className="text-muted-foreground">CEO, TechCorp</p>
                </div>
              </div>
              <div className="relative">
                <svg className="absolute top-0 left-0 h-8 w-8 text-primary/20 -mt-3 -ml-3" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-muted-foreground pl-6">
                  "TrackPro has transformed the way we manage our remote teams. The productivity insights have been invaluable for our business operations."
                </p>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div 
              className="bg-card p-6 rounded-xl shadow-md border hover:shadow-xl transition-shadow duration-300"
              variants={fadeIn}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 relative rounded-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
                    alt="Profile"
                    className="rounded-full object-cover h-full w-full"
                    width={48}
                    height={48}
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-foreground">Sarah Johnson</h4>
                  <p className="text-muted-foreground">HR Director, Global Inc.</p>
                </div>
              </div>
              <div className="relative">
                <svg className="absolute top-0 left-0 h-8 w-8 text-primary/20 -mt-3 -ml-3" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-muted-foreground pl-6">
                  "The attendance tracking and reporting features have simplified our HR processes dramatically. I highly recommend TrackPro."
                </p>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div 
              className="bg-card p-6 rounded-xl shadow-md border hover:shadow-xl transition-shadow duration-300"
              variants={fadeIn}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 relative rounded-full overflow-hidden">
                  <img
                    src="/images/worker.jpeg"
                    alt="Profile"
                    className="rounded-full object-cover h-full w-full"
                    width={48}
                    height={48}
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-foreground">Michael Lee</h4>
                  <p className="text-muted-foreground">Team Lead, Innovate Solutions</p>
                </div>
              </div>
              <div className="relative">
                <svg className="absolute top-0 left-0 h-8 w-8 text-primary/20 -mt-3 -ml-3" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-muted-foreground pl-6">
                  "Thanks to TrackPro, our team's productivity has increased by 30%. The insights we've gained have helped us optimize our workflow."
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        className="bg-primary"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <motion.h2 
            className="text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl"
            variants={fadeInFromLeft}
          >
            <span className="block">Ready to boost your team's productivity?</span>
            <span className="block text-primary-foreground/80">Start your free trial today.</span>
          </motion.h2>
          <motion.div 
            className="mt-8 flex lg:mt-0 lg:flex-shrink-0 space-x-4"
            variants={fadeInFromRight}
          >
            <Button size="lg" variant="secondary" asChild className="relative overflow-hidden group">
              <a href="/signup">
                <span className="relative z-10">Get started</span>
                <motion.span 
                  className="absolute inset-0 bg-white/10" 
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20" asChild>
              <a href="/contact">Contact sales</a>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <motion.nav 
            className="-mx-5 -my-2 flex flex-wrap justify-center" 
            aria-label="Footer"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div className="px-5 py-2" variants={fadeIn}>
              <a href="#" className="text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
                About
              </a>
            </motion.div>
            <motion.div className="px-5 py-2" variants={fadeIn}>
              <a href="#" className="text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
                Features
              </a>
            </motion.div>
            <motion.div className="px-5 py-2" variants={fadeIn}>
              <a href="#" className="text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
                Pricing
              </a>
            </motion.div>
            <motion.div className="px-5 py-2" variants={fadeIn}>
              <a href="#" className="text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
                Privacy
              </a>
            </motion.div>
            <motion.div className="px-5 py-2" variants={fadeIn}>
              <a href="#" className="text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
                Terms
              </a>
            </motion.div>
            <motion.div className="px-5 py-2" variants={fadeIn}>
              <a href="#" className="text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
                Contact
              </a>
            </motion.div>
          </motion.nav>
          <motion.p 
            className="mt-8 text-center text-base text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            &copy; 2024 TrackPro. All rights reserved.
          </motion.p>
        </div>
      </footer>
    </div>
  );
}
