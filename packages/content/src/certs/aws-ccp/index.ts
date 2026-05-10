/**
 * AWS Certified Cloud Practitioner (CLF-C02) — Cloud Village theme.
 */

import { q, fc } from '../../authoring';
import { awsCcpLore } from '../../lore/aws-ccp';

export const CERT_ID = 'aws-ccp';
export const EXAM_CODE = 'CLF-C02';

export const meta = {
  id: CERT_ID, provider: 'aws' as const,
  examName: 'AWS Certified Cloud Practitioner', examCode: EXAM_CODE,
  examVersion: 'verify-before-publish',
  officialSourceUrl: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
  lastVerifiedDate: '2026-05-01',
  themeName: 'Cloud Village',
  themeBlurb: 'A village in the sky. Each building is an AWS service. Learn what each one does before you try to architect anything.',
  displayOrder: 4,
  lore: awsCcpLore,
};

export const examCodes = [{
  examCode: EXAM_CODE, examName: 'AWS Certified Cloud Practitioner',
  scaledScoreMin: 100, scaledScoreMax: 1000, passingScaledScore: 700,
  questionCount: 65, timeLimitMinutes: 90,
}];

export const domains = [
  { id: 'ccp-concepts', certId: CERT_ID, title: 'Cloud Concepts', blurb: 'Cloud value, AWS Cloud economics, design principles.', weight: 0.24, displayOrder: 1 },
  { id: 'ccp-security', certId: CERT_ID, title: 'Security and Compliance', blurb: 'Shared Responsibility Model, IAM basics, compliance.', weight: 0.30, displayOrder: 2 },
  { id: 'ccp-tech', certId: CERT_ID, title: 'Cloud Technology and Services', blurb: 'Core AWS services and how they fit together.', weight: 0.34, displayOrder: 3 },
  { id: 'ccp-billing', certId: CERT_ID, title: 'Billing, Pricing, and Support', blurb: 'Pricing models, billing tools, support plans.', weight: 0.12, displayOrder: 4 },
];

export const objectives = [
  { id: 'ccp-obj-shared-resp', certId: CERT_ID, domainId: 'ccp-security', title: 'Shared Responsibility Model', difficulty: 'beginner', estimatedMinutes: 15, prerequisites: [], concepts: ['security of vs in the cloud', 'service categories'], masteryCriteria: { minQuizScore: 80, requiredReviews: 4, requiredBossBattles: 1, requiresSelfExplanation: true }, displayOrder: 1 },
  { id: 'ccp-obj-iam', certId: CERT_ID, domainId: 'ccp-security', title: 'IAM Fundamentals', difficulty: 'beginner', estimatedMinutes: 20, prerequisites: [], concepts: ['users', 'groups', 'roles', 'policies', 'least privilege'], masteryCriteria: { minQuizScore: 75, requiredReviews: 4, requiredBossBattles: 0, requiresSelfExplanation: true }, displayOrder: 2 },
  { id: 'ccp-obj-core-services', certId: CERT_ID, domainId: 'ccp-tech', title: 'Core AWS Services', difficulty: 'beginner', estimatedMinutes: 30, prerequisites: [], concepts: ['EC2', 'S3', 'RDS', 'Lambda', 'VPC'], masteryCriteria: { minQuizScore: 75, requiredReviews: 5, requiredBossBattles: 1, requiresSelfExplanation: true }, displayOrder: 3 },
  { id: 'ccp-obj-pricing', certId: CERT_ID, domainId: 'ccp-billing', title: 'AWS Pricing Models', difficulty: 'beginner', estimatedMinutes: 20, prerequisites: [], concepts: ['On-Demand', 'Reserved Instances', 'Savings Plans', 'Spot'], masteryCriteria: { minQuizScore: 75, requiredReviews: 3, requiredBossBattles: 0, requiresSelfExplanation: false }, displayOrder: 4 },
];

export const lessons = [
  {
    id: 'ccp-lesson-shared-resp', certId: CERT_ID, objectiveId: 'ccp-obj-shared-resp',
    title: 'Who Is Responsible For What', estimatedMinutes: 8,
    loreIntro: {
      scene: 'You arrive at Shared Responsibility Court. Sage Nimbus is already there, waiting.',
      mentorMessage: 'This region\'s threat: confusion about who patches what. Today\'s training: Who Is Responsible For What. Pay attention — the field will test you on this.',
      missionObjective: 'Master the concepts in Who Is Responsible For What so you can identify and resolve confusion about who patches what on sight.',
    },
    blocks: [
      { kind: 'intro', body: 'The Shared Responsibility Model is the most-tested concept on the exam. Internalize it before anything else.' },
      { kind: 'concept', body: 'AWS is responsible for security OF the cloud: hardware, hypervisor, physical facilities, the global network. The customer is responsible for security IN the cloud: data, IAM, OS patches on EC2, network configuration, encryption.' },
      { kind: 'decision_table', body: 'Edge of physical facility → AWS. Hardware/storage media disposal → AWS. EC2 OS patching → Customer. S3 bucket policy → Customer. Hypervisor → AWS. Data classification → Customer.' },
      { kind: 'common_mistake', body: 'Assuming AWS patches your EC2 instances. They patch the hypervisor and managed services; you patch the OS on instances you launch.' },
    ],
  },
  {
    id: 'ccp-lesson-core', certId: CERT_ID, objectiveId: 'ccp-obj-core-services',
    title: 'The Core Five', estimatedMinutes: 10,
    loreIntro: {
      scene: 'You arrive at S3 Shrine. Sage Nimbus is already there, waiting.',
      mentorMessage: 'This region\'s threat: wrong storage classes and confused service choices. Today\'s training: The Core Five. Pay attention — the field will test you on this.',
      missionObjective: 'Master the concepts in The Core Five so you can identify and resolve wrong storage classes and confused service choices on sight.',
    },
    blocks: [
      { kind: 'intro', body: 'EC2, S3, RDS, Lambda, VPC. If you can describe each in one sentence, you understand half the exam.' },
      { kind: 'concept', body: 'EC2: virtual servers — IaaS compute. S3: object storage with 99.999999999% durability. RDS: managed relational databases (MySQL, Postgres, etc.). Lambda: serverless functions, billed by ms. VPC: your private network within AWS.' },
      { kind: 'analogy', body: 'EC2 is renting a computer. S3 is renting a hard drive that is also a website. Lambda is paying only when someone asks for something. VPC is the fence around all of it.' },
    ],
  },
  {
    id: 'ccp-lesson-pricing', certId: CERT_ID, objectiveId: 'ccp-obj-pricing',
    title: 'Paying for the Cloud', estimatedMinutes: 8,
    loreIntro: {
      scene: 'You arrive at Billing Bazaar. Sage Nimbus is already there, waiting.',
      mentorMessage: 'This region\'s threat: untagged resources and wrong pricing models. Today\'s training: Paying for the Cloud. Pay attention — the field will test you on this.',
      missionObjective: 'Master the concepts in Paying for the Cloud so you can identify and resolve untagged resources and wrong pricing models on sight.',
    },
    blocks: [
      { kind: 'intro', body: 'AWS pricing has four buckets. Knowing which one applies in a scenario is exam currency.' },
      { kind: 'concept', body: 'On-Demand: pay by the hour/second, no commitment, highest price. Reserved Instances (1 or 3 year): up to 72% off, commitment to a specific instance type. Savings Plans: up to 72% off, flexible commitment to spend per hour. Spot: up to 90% off, AWS can terminate with 2 minutes notice.' },
      { kind: 'decision_table', body: 'Workload predictable, will run 24/7 for years? → Reserved or Savings Plan. Workload bursty, can\'t predict? → On-Demand. Workload fault-tolerant, can be interrupted? → Spot. Need flexibility in instance family? → Savings Plan over RI.' },
    ],
  },
];

const C = CERT_ID;

export const flashcards = [
  fc('ccp-fc-001', C, 'ccp-security', 'ccp-obj-shared-resp', 'Who patches the OS on an EC2 instance?', 'The customer.', 'basic'),
  fc('ccp-fc-002', C, 'ccp-security', 'ccp-obj-shared-resp', 'Who is responsible for the hypervisor?', 'AWS.', 'basic'),
  fc('ccp-fc-003', C, 'ccp-security', 'ccp-obj-shared-resp', 'Who configures S3 bucket policies?', 'The customer.', 'basic'),
  fc('ccp-fc-004', C, 'ccp-security', 'ccp-obj-shared-resp', 'Who manages physical security at AWS data centers?', 'AWS.', 'basic'),
  fc('ccp-fc-005', C, 'ccp-security', 'ccp-obj-iam', 'IAM principle that grants the minimum permissions needed?', 'Principle of least privilege.', 'basic'),
  fc('ccp-fc-006', C, 'ccp-security', 'ccp-obj-iam', 'What is an IAM role?', 'An identity with permissions that can be assumed by a user, service, or account — temporary credentials, not long-term keys.', 'basic'),
  fc('ccp-fc-007', C, 'ccp-security', 'ccp-obj-iam', 'When should an EC2 instance use an IAM role?', 'Always — never store long-term access keys on an EC2 instance.', 'basic'),
  fc('ccp-fc-008', C, 'ccp-security', 'ccp-obj-iam', 'What is MFA in AWS?', 'Multi-Factor Authentication — adds a second factor beyond password for IAM users (especially the root account).', 'basic'),
  fc('ccp-fc-009', C, 'ccp-tech', 'ccp-obj-core-services', 'What service is S3?', 'Object storage service. 99.999999999% durability. Stores any amount of data.', 'basic'),
  fc('ccp-fc-010', C, 'ccp-tech', 'ccp-obj-core-services', 'What service is EC2?', 'Elastic Compute Cloud — virtual servers (instances) you rent by the hour or second.', 'basic'),
  fc('ccp-fc-011', C, 'ccp-tech', 'ccp-obj-core-services', 'What service is RDS?', 'Relational Database Service — managed MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Aurora.', 'basic'),
  fc('ccp-fc-012', C, 'ccp-tech', 'ccp-obj-core-services', 'What service is Lambda?', 'Serverless compute — runs code in response to events, billed per millisecond of execution.', 'basic'),
  fc('ccp-fc-013', C, 'ccp-tech', 'ccp-obj-core-services', 'What service is VPC?', 'Virtual Private Cloud — your isolated network within AWS where you launch resources.', 'basic'),
  fc('ccp-fc-014', C, 'ccp-tech', 'ccp-obj-core-services', 'What is an Availability Zone?', 'One or more discrete data centers within an AWS Region. AZs are isolated from each other but connected by low-latency links.', 'basic'),
  fc('ccp-fc-015', C, 'ccp-tech', 'ccp-obj-core-services', 'What is a Region?', 'A geographic area containing multiple AZs. Resources in one Region are not automatically replicated to another.', 'basic'),
  fc('ccp-fc-016', C, 'ccp-billing', 'ccp-obj-pricing', 'Cheapest EC2 pricing model for fault-tolerant workloads?', 'Spot Instances — up to 90% off, but AWS can reclaim them with 2 minutes notice.', 'basic'),
  fc('ccp-fc-017', C, 'ccp-billing', 'ccp-obj-pricing', 'Best pricing for steady-state workloads running 24/7 for 1+ years?', 'Reserved Instances or Compute Savings Plans — up to 72% off On-Demand.', 'basic'),
  fc('ccp-fc-018', C, 'ccp-billing', 'ccp-obj-pricing', 'Which AWS support plan provides a Technical Account Manager (TAM)?', 'Enterprise Support (and Enterprise On-Ramp at a smaller scale).', 'basic'),
  fc('ccp-fc-019', C, 'ccp-billing', 'ccp-obj-pricing', 'Which tool helps you estimate AWS costs before deploying?', 'AWS Pricing Calculator.', 'basic'),
  fc('ccp-fc-020', C, 'ccp-concepts', 'ccp-obj-shared-resp', 'Three benefits of cloud computing per AWS?', 'Scale, agility, pay-as-you-go (and elasticity, global reach, focus on what matters).', 'basic'),
];

const E = EXAM_CODE;

export const questionBank = [
  q({ id: 'ccp-q-001', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-shared-resp',
    q: 'Under the AWS Shared Responsibility Model, who is responsible for patching the operating system of an Amazon EC2 instance?',
    a: [['a','AWS'],['b','The customer', true],['c','Both AWS and the customer'],['d','The OS vendor']],
    why: 'Customer is responsible for security IN the cloud, including OS patching for EC2.',
    tags: ['shared-responsibility'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-002', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-shared-resp',
    q: 'A company uses Amazon RDS. Who is responsible for patching the database engine?',
    a: [['a','AWS', true],['b','The customer'],['c','The customer must request a maintenance window from AWS'],['d','Neither — RDS does not need patching']],
    why: 'RDS is a managed service. AWS handles engine patching during maintenance windows the customer configures.',
    wrong: { c: 'Maintenance windows are configured by the customer but AWS performs the patching.' },
    tags: ['shared-responsibility','rds'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccp-q-003', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'Which AWS service provides serverless compute that runs code in response to events?',
    a: [['a','EC2'],['b','Lambda', true],['c','ECS'],['d','Fargate']],
    why: 'Lambda is the serverless compute service.',
    wrong: { a: 'EC2 is virtual servers.', c: 'ECS runs containers but the customer manages compute (unless on Fargate).', d: 'Fargate is serverless containers but not the most common answer for "code in response to events."' },
    tags: ['lambda','serverless'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-004', certId: C, examCode: E, domainId: 'ccp-billing', objectiveId: 'ccp-obj-pricing',
    q: 'A workload runs 24/7 with stable usage and will continue for at least three years. Which pricing model is MOST cost-effective?',
    a: [['a','On-Demand'],['b','Spot Instances'],['c','Reserved Instances or Savings Plans (3-year)', true],['d','Dedicated Hosts']],
    why: '3-year RIs/Savings Plans give the highest discount for predictable, long-term workloads.',
    wrong: { a: 'On-Demand is most expensive.', b: 'Spot is for interruptible workloads.', d: 'Dedicated Hosts are for compliance, not cost optimization.' },
    tags: ['pricing','reserved-instances'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccp-q-005', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'A company needs durable object storage with 99.999999999% durability. Which service should they use?',
    a: [['a','EBS'],['b','S3', true],['c','EFS'],['d','Instance Store']],
    why: 'S3 (Standard) provides 11 9s of durability for objects.',
    wrong: { a: 'EBS is block storage attached to EC2.', c: 'EFS is shared file storage.', d: 'Instance Store is ephemeral.' },
    tags: ['s3','durability'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-006', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-iam',
    q: 'What is the recommended way to give an EC2 instance permission to access an S3 bucket?',
    a: [
      ['a','Hard-code access keys in the application'],
      ['b','Assign an IAM role to the instance', true],
      ['c','Use the root account credentials'],
      ['d','Make the S3 bucket public']
    ],
    why: 'IAM roles provide temporary credentials with no long-term keys to leak.',
    wrong: { a: 'Hard-coded keys leak through git, logs, and backups.', c: 'Root credentials should never be used by applications.', d: 'Public buckets break least privilege.' },
    tags: ['iam','roles','ec2'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-007', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'A company wants to deploy a relational database without managing the underlying infrastructure. Which service is BEST?',
    a: [['a','EC2 with self-installed MySQL'],['b','RDS', true],['c','DynamoDB'],['d','S3']],
    why: 'RDS is managed relational database. AWS handles patching, backups, replication.',
    wrong: { a: 'Self-installed on EC2 means customer manages everything.', c: 'DynamoDB is NoSQL, not relational.', d: 'S3 is object storage.' },
    tags: ['rds','databases'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-008', certId: C, examCode: E, domainId: 'ccp-billing', objectiveId: 'ccp-obj-pricing',
    q: 'Which AWS support plan offers a designated Technical Account Manager?',
    a: [['a','Basic'],['b','Developer'],['c','Business'],['d','Enterprise', true]],
    why: 'Enterprise Support includes a TAM. Enterprise On-Ramp also offers TAM access at a reduced level.',
    tags: ['support-plans'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccp-q-009', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'What is the difference between a Region and an Availability Zone?',
    a: [
      ['a','They are the same thing'],
      ['b','A Region is a geographic area containing multiple AZs which are isolated data centers', true],
      ['c','An AZ is a country, a Region is a continent'],
      ['d','Regions are bigger Availability Zones']
    ],
    why: 'Regions are geographic locations. Each Region has multiple AZs (isolated data centers) for high availability.',
    tags: ['regions','az'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-010', certId: C, examCode: E, domainId: 'ccp-concepts', objectiveId: 'ccp-obj-core-services',
    q: 'Which of the following are benefits of cloud computing per AWS? (Choose two.)',
    type: 'multiple_select',
    a: [
      ['a','Trade capital expense for variable expense', true],
      ['b','Stop guessing capacity', true],
      ['c','Hardware ownership'],
      ['d','Higher upfront costs'],
      ['e','Reduced regulatory compliance requirements']
    ],
    why: 'Two of the AWS Six Advantages: trade capex for opex, stop guessing capacity. The others on the list: benefit from massive economies of scale, increase speed and agility, stop spending money running data centers, go global in minutes.',
    tags: ['cloud-benefits'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccp-q-011', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-iam',
    q: 'An organization wants to enforce MFA on all IAM users. Where is this configured?',
    a: [
      ['a','In each user\'s console preferences'],
      ['b','By attaching a policy that requires MFA for sensitive actions, plus enabling MFA on each user', true],
      ['c','By contacting AWS Support'],
      ['d','MFA cannot be required, only suggested']
    ],
    why: 'IAM policies can include conditions like aws:MultiFactorAuthPresent to enforce MFA. Each user must also have MFA configured on their account.',
    tags: ['iam','mfa'], difficulty: 'hard', time: 60 }),

  q({ id: 'ccp-q-012', certId: C, examCode: E, domainId: 'ccp-billing', objectiveId: 'ccp-obj-pricing',
    q: 'Which service provides recommendations to optimize AWS costs and security?',
    a: [['a','AWS Trusted Advisor', true],['b','AWS CloudTrail'],['c','Amazon Inspector'],['d','AWS Config']],
    why: 'Trusted Advisor checks accounts against best practices in five categories including cost optimization.',
    wrong: { b: 'CloudTrail logs API calls.', c: 'Inspector finds vulnerabilities.', d: 'Config tracks resource configuration changes.' },
    tags: ['trusted-advisor'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccp-q-013', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'Which storage class is MOST cost-effective for data accessed less than once per quarter that must be retrievable within minutes?',
    a: [
      ['a','S3 Standard'],
      ['b','S3 Standard-IA'],
      ['c','S3 Glacier Instant Retrieval', true],
      ['d','S3 Glacier Deep Archive']
    ],
    why: 'Glacier Instant Retrieval is for rarely accessed data that still needs millisecond access — cheaper than Standard-IA, more expensive than the deeper Glacier tiers.',
    wrong: { a: 'Standard is for frequent access.', b: 'Standard-IA is for less-frequent but monthly access.', d: 'Deep Archive has hours of retrieval time.' },
    tags: ['s3','storage-classes'], difficulty: 'hard', time: 60 }),

  q({ id: 'ccp-q-014', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-iam',
    q: 'Which of the following is a best practice for the AWS root account?',
    a: [
      ['a','Use it for daily operations'],
      ['b','Enable MFA, lock it away, and create IAM users for daily tasks', true],
      ['c','Share its credentials with the IT team'],
      ['d','Disable MFA so it cannot be locked out']
    ],
    why: 'Root account should be protected with MFA, used only for tasks requiring root, and never used for daily ops.',
    tags: ['root-account','iam'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-015', certId: C, examCode: E, domainId: 'ccp-billing', objectiveId: 'ccp-obj-pricing',
    q: 'A startup wants to estimate monthly costs for a new architecture before launching. Which tool should they use?',
    a: [['a','AWS Cost Explorer'],['b','AWS Pricing Calculator', true],['c','AWS Budgets'],['d','AWS Trusted Advisor']],
    why: 'Pricing Calculator lets you model architectures and estimate costs before deployment. Cost Explorer analyzes actual past spend.',
    tags: ['pricing-calculator'], difficulty: 'medium', time: 45 }),
  q({ id: 'ccp-q-016', certId: C, examCode: E, domainId: 'ccp-billing', objectiveId: 'ccp-obj-pricing',
    q: 'A workload runs 24/7 for the next 3 years with predictable steady usage. Which pricing option is most cost-effective?',
    a: [['a','On-Demand Instances'],['b','3-Year Reserved Instance (All Upfront)', true],['c','Spot Instances'],['d','Dedicated Hosts']],
    why: '3-Year RIs with all-upfront payment offer maximum savings (up to ~72%) for predictable steady-state workloads.',
    trap: 'Spot is cheapest per-hour but can be reclaimed — never use for production-critical 24/7 workloads.',
    tags: ['ri', 'pricing'], difficulty: 'medium', time: 50 }),
  q({ id: 'ccp-q-017', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'Which AWS service provides a managed relational database?',
    a: [['a','DynamoDB'],['b','S3'],['c','RDS', true],['d','Redshift']],
    why: 'RDS (Relational Database Service) is the managed offering for engines like MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, and Aurora.',
    trap: 'DynamoDB is NoSQL. Redshift is a data warehouse, not a transactional relational DB.',
    tags: ['rds'], difficulty: 'easy', time: 30 }),
  q({ id: 'ccp-q-018', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-iam',
    q: 'A developer needs temporary AWS credentials to call APIs from an EC2 instance. What is the recommended approach?',
    a: [['a','Hardcode access keys in the application'],['b','Store credentials in environment variables'],['c','Attach an IAM role to the EC2 instance', true],['d','Email the keys to the developer']],
    why: 'IAM roles attached to EC2 instances provide rotating temporary credentials via the instance metadata service.',
    trap: 'Hardcoded keys end up in Git history. Environment variables persist on disk. Roles are the only safe pattern.',
    tags: ['iam', 'roles'], difficulty: 'medium', time: 45 }),
  q({ id: 'ccp-q-019', certId: C, examCode: E, domainId: 'ccp-concepts', objectiveId: 'ccp-obj-shared-resp',
    q: 'Which AWS Well-Architected pillar focuses on the ability to recover from infrastructure or service disruptions?',
    a: [['a','Operational Excellence'],['b','Security'],['c','Reliability', true],['d','Cost Optimization']],
    why: 'Reliability covers fault tolerance, recovery from failures, and meeting demand. Multi-AZ deployments live here.',
    trap: 'Operational Excellence is about running and monitoring systems. Reliability is about surviving disruptions.',
    tags: ['well-architected'], difficulty: 'medium', time: 40 }),
  q({ id: 'ccp-q-020', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'Which storage class is most cost-effective for data accessed less than once per quarter but requires millisecond retrieval?',
    a: [['a','S3 Standard'],['b','S3 Standard-IA (Infrequent Access)', true],['c','S3 Glacier Deep Archive'],['d','S3 One Zone-IA']],
    why: 'S3 Standard-IA offers millisecond access at lower per-GB cost than Standard, with a retrieval fee that pays off when access frequency is low.',
    trap: 'Glacier classes need minutes to hours to retrieve — wrong if millisecond access is required.',
    tags: ['s3', 'storage-class'], difficulty: 'medium', time: 50 }),
  q({ id: 'ccp-q-021', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-shared-resp',
    q: 'Under the Shared Responsibility Model, which of the following are AWS responsibilities? (Choose two)',
    a: [['a','Patching the EC2 guest OS'],['b','Physical security of data centers', true],['c','Configuring S3 bucket policies'],['d','Hypervisor patching', true],['e','Application code security']],
    why: 'AWS handles security OF the cloud — physical infrastructure and the hypervisor. The customer handles security IN the cloud.',
    trap: 'Patching the EC2 guest OS sounds like AWS but is the customer\'s. AWS only patches the hypervisor below.',
    tags: ['shared-responsibility'], difficulty: 'medium', time: 60 }),
  q({ id: 'ccp-q-022', certId: C, examCode: E, domainId: 'ccp-billing', objectiveId: 'ccp-obj-pricing',
    q: 'Which AWS Support plan includes a Technical Account Manager (TAM)?',
    a: [['a','Basic'],['b','Developer'],['c','Business'],['d','Enterprise', true]],
    why: 'Only the Enterprise Support plan includes a designated TAM with proactive guidance and architectural reviews.',
    trap: 'Business Support includes 24/7 response and Trusted Advisor full checks but NOT a TAM.',
    tags: ['support-plans'], difficulty: 'medium', time: 40 }),

  // ── CLOUD CONCEPTS (14 new) ───────────────────────────────────────────────

  q({ id: 'ccp-q-023', certId: C, examCode: E, domainId: 'ccp-concepts', objectiveId: 'ccp-obj-shared-resp',
    q: 'Which of the following are among the six advantages of cloud computing identified by AWS? (Choose two.)',
    type: 'multiple_select',
    a: [
      ['a','Go global in minutes', true],
      ['b','Increase capital expenditures'],
      ['c','Stop spending money running and maintaining data centers', true],
      ['d','Maintain full control of physical hardware'],
      ['e','Reduce the need for software updates']
    ],
    why: 'AWS lists six advantages: trade CapEx for OpEx, benefit from massive economies of scale, stop guessing capacity, increase speed and agility, stop spending on data centers, go global in minutes.',
    tags: ['cloud-benefits'], difficulty: 'easy', time: 40 }),

  q({ id: 'ccp-q-024', certId: C, examCode: E, domainId: 'ccp-concepts', objectiveId: 'ccp-obj-shared-resp',
    q: 'Which AWS Well-Architected Framework pillar focuses on using resources efficiently and eliminating unnecessary costs?',
    a: [['a','Reliability'],['b','Performance Efficiency'],['c','Cost Optimization', true],['d','Operational Excellence']],
    why: 'Cost Optimization covers using the right services, right sizes, and pricing models to minimize spend while meeting requirements.',
    trap: 'Performance Efficiency is about using resources efficiently for performance — Cost Optimization is specifically about spending less money.',
    tags: ['well-architected','cost-optimization'], difficulty: 'medium', time: 40 }),

  q({ id: 'ccp-q-025', certId: C, examCode: E, domainId: 'ccp-concepts', objectiveId: 'ccp-obj-shared-resp',
    q: 'Which AWS Well-Architected Framework pillar was added most recently and focuses on minimizing environmental impact?',
    a: [['a','Cost Optimization'],['b','Reliability'],['c','Sustainability', true],['d','Security']],
    why: 'Sustainability (the sixth pillar added in 2021) focuses on minimizing environmental impact of cloud workloads — energy consumption, carbon footprint.',
    tags: ['well-architected','sustainability'], difficulty: 'hard', time: 50 }),

  q({ id: 'ccp-q-026', certId: C, examCode: E, domainId: 'ccp-concepts', objectiveId: 'ccp-obj-shared-resp',
    q: 'An organization needs near-zero Recovery Time Objective (RTO) and near-zero Recovery Point Objective (RPO). Which capability does this describe?',
    a: [['a','High availability'],['b','Fault tolerance', true],['c','Backup and restore'],['d','Disaster recovery']],
    why: 'Fault tolerance targets zero or near-zero RTO/RPO by maintaining full redundancy — systems continue operating with no data loss when a failure occurs.',
    trap: 'Disaster recovery has an RTO/RPO measured in hours or minutes. Fault tolerance eliminates them.',
    tags: ['fault-tolerance','rto-rpo'], difficulty: 'hard', time: 55 }),

  q({ id: 'ccp-q-027', certId: C, examCode: E, domainId: 'ccp-concepts', objectiveId: 'ccp-obj-shared-resp',
    q: 'A company hosts some workloads on-premises and some on AWS, connecting them via VPN. Which cloud deployment model is this?',
    a: [['a','Public cloud'],['b','Private cloud'],['c','Hybrid cloud', true],['d','Community cloud']],
    why: 'Hybrid cloud combines on-premises (private) infrastructure with public cloud services, connected by a network (VPN or Direct Connect).',
    tags: ['cloud-models'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-028', certId: C, examCode: E, domainId: 'ccp-concepts', objectiveId: 'ccp-obj-shared-resp',
    q: 'Which AWS infrastructure component provides reduced latency by caching content geographically close to end users?',
    a: [['a','Availability Zones'],['b','AWS Regions'],['c','Edge Locations', true],['d','Local Zones']],
    why: 'Edge locations are used by CloudFront (CDN) and Route 53 to serve content from points of presence near end users worldwide.',
    wrong: { a: 'AZs are data centers within a Region.', b: 'Regions are geographic clusters of AZs.', d: 'Local Zones extend AWS compute to metropolitan areas.' },
    tags: ['edge-locations','cloudfront'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-029', certId: C, examCode: E, domainId: 'ccp-concepts', objectiveId: 'ccp-obj-shared-resp',
    q: 'What term describes the ability to quickly increase or decrease cloud resources to match demand automatically?',
    a: [['a','Scalability'],['b','Elasticity', true],['c','Durability'],['d','Availability']],
    why: 'Elasticity is the automatic and dynamic scaling of resources in real time with demand — up and down. Scalability is the ability to scale (may be manual).',
    trap: 'Scalability means you CAN scale. Elasticity means it happens automatically and dynamically — this is a key distinction on the CCP exam.',
    tags: ['elasticity','cloud-concepts'], difficulty: 'medium', time: 40 }),

  q({ id: 'ccp-q-030', certId: C, examCode: E, domainId: 'ccp-concepts', objectiveId: 'ccp-obj-shared-resp',
    q: 'A company performs a Total Cost of Ownership (TCO) analysis before migrating to AWS. What is the PRIMARY purpose of a TCO analysis?',
    a: [
      ['a','To determine which AWS support plan to purchase'],
      ['b','To compare the full cost of on-premises infrastructure vs. running on AWS', true],
      ['c','To calculate Reserved Instance pricing'],
      ['d','To list all AWS services needed for migration']
    ],
    why: 'TCO analysis captures all on-premises costs (hardware, power, cooling, facilities, staff) and compares them against projected AWS spend to justify migration.',
    tags: ['tco','cloud-economics'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccp-q-031', certId: C, examCode: E, domainId: 'ccp-concepts', objectiveId: 'ccp-obj-shared-resp',
    q: 'A company wants to move an application to AWS with the least possible code changes, simply moving it to EC2. Which migration strategy (one of the 6 Rs) is this?',
    a: [['a','Replatform'],['b','Repurchase'],['c','Rehost (Lift and Shift)', true],['d','Refactor']],
    why: 'Rehost (lift and shift) moves an application to the cloud with no changes — just migrates from on-prem hardware to EC2 instances.',
    trap: 'Replatform makes minor optimizations (e.g., moving to RDS) without changing core architecture. Rehost changes nothing.',
    tags: ['migration','6rs'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccp-q-032', certId: C, examCode: E, domainId: 'ccp-concepts', objectiveId: 'ccp-obj-shared-resp',
    q: 'The AWS Cloud Adoption Framework (CAF) organizes guidance into perspectives. Which perspective focuses on business value and outcomes?',
    a: [['a','Platform perspective'],['b','Business perspective', true],['c','Security perspective'],['d','Operations perspective']],
    why: 'The AWS CAF Business perspective ensures cloud investments align with business outcomes and covers business case development, strategy, and benefit realization.',
    tags: ['caf','cloud-concepts'], difficulty: 'hard', time: 55 }),

  q({ id: 'ccp-q-033', certId: C, examCode: E, domainId: 'ccp-concepts', objectiveId: 'ccp-obj-shared-resp',
    q: 'Which cloud model charges customers only for the resources they actually consume, with no upfront commitment?',
    a: [['a','Reserved capacity model'],['b','Pay-as-you-go model', true],['c','Dedicated host model'],['d','Enterprise license model']],
    why: 'Pay-as-you-go (operational expense model) is a core cloud benefit — you pay only for what you use, shifting from capital to operational expenditure.',
    tags: ['cloud-economics','pricing'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-034', certId: C, examCode: E, domainId: 'ccp-concepts', objectiveId: 'ccp-obj-shared-resp',
    q: 'A serverless architecture removes which operational burden compared to running on EC2?',
    a: [
      ['a','Writing application code'],
      ['b','Managing and patching the underlying server OS', true],
      ['c','Configuring IAM permissions'],
      ['d','Setting up VPC networking']
    ],
    why: 'Serverless (Lambda, Fargate) means AWS manages the OS, patching, and capacity — customers only write and deploy code.',
    tags: ['serverless','cloud-concepts'], difficulty: 'medium', time: 40 }),

  q({ id: 'ccp-q-035', certId: C, examCode: E, domainId: 'ccp-concepts', objectiveId: 'ccp-obj-shared-resp',
    q: 'Which benefit of cloud computing refers to the ability to experiment and innovate with new technologies quickly, without long procurement cycles?',
    a: [['a','Elasticity'],['b','Durability'],['c','Agility', true],['d','High availability']],
    why: 'Agility — the ability to spin up experiments in minutes, fail fast, and iterate — is one of the six AWS cloud advantages and a key exam concept.',
    tags: ['agility','cloud-benefits'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-036', certId: C, examCode: E, domainId: 'ccp-concepts', objectiveId: 'ccp-obj-shared-resp',
    q: 'A company wants to deploy its application in multiple AWS Regions to ensure it survives a regional failure. Which concept does this represent?',
    a: [['a','Multi-AZ deployment'],['b','Fault isolation'],['c','Disaster recovery with geographic redundancy', true],['d','Edge location caching']],
    why: 'Deploying across Regions protects against full Region failures — the highest level of geographic redundancy in AWS, supporting DR objectives.',
    trap: 'Multi-AZ protects against single data-center failures within a Region. Multi-Region protects against an entire Region going down.',
    tags: ['disaster-recovery','multi-region'], difficulty: 'medium', time: 45 }),

  // ── SECURITY (13 new) ─────────────────────────────────────────────────────

  q({ id: 'ccp-q-037', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-iam',
    q: 'An IAM policy includes the statement: Effect: Deny, Action: s3:DeleteObject, Resource: *. What does this policy do?',
    a: [
      ['a','Denies all S3 access'],
      ['b','Denies the ability to delete any S3 object, overriding any Allow for that action', true],
      ['c','Allows all S3 actions except delete'],
      ['d','This statement has no effect without an explicit Allow']
    ],
    why: 'In IAM, an explicit Deny always overrides any Allow. This Deny statement prevents S3 object deletion even if another policy grants it.',
    trap: 'IAM evaluation logic: explicit Deny wins over explicit Allow, which wins over no policy (implicit deny).',
    tags: ['iam','policy','deny'], difficulty: 'hard', time: 60 }),

  q({ id: 'ccp-q-038', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-iam',
    q: 'A company has multiple AWS accounts in an AWS Organization. They want to prevent any account from launching resources outside of us-east-1 and eu-west-1. Which feature enforces this?',
    a: [['a','IAM permissions boundary'],['b','Service Control Policy (SCP)', true],['c','Resource-based policy'],['d','IAM role trust policy']],
    why: 'SCPs applied to OUs or accounts in AWS Organizations act as guardrails — they restrict what IAM users/roles in those accounts can do, regardless of their IAM permissions.',
    trap: 'SCPs do not grant permissions; they only restrict. An SCP is a maximum permission boundary for an account.',
    tags: ['organizations','scp'], difficulty: 'hard', time: 60 }),

  q({ id: 'ccp-q-039', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-shared-resp',
    q: 'Which AWS service records every API call made in an account, who made it, from where, and when?',
    a: [['a','Amazon CloudWatch'],['b','AWS Config'],['c','AWS CloudTrail', true],['d','AWS Security Hub']],
    why: 'CloudTrail logs all API activity — management events, data events, and insights — providing an audit trail for governance and compliance.',
    wrong: { a: 'CloudWatch monitors metrics and logs.', b: 'Config tracks resource configuration changes.', d: 'Security Hub aggregates findings from multiple services.' },
    tags: ['cloudtrail','audit'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-040', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-shared-resp',
    q: 'Which AWS service continuously monitors resource configurations and evaluates them against desired compliance rules?',
    a: [['a','AWS CloudTrail'],['b','Amazon GuardDuty'],['c','AWS Config', true],['d','AWS Inspector']],
    why: 'AWS Config records resource configuration history and evaluates it against Config Rules, flagging non-compliant resources.',
    wrong: { a: 'CloudTrail records API calls, not resource configurations.', b: 'GuardDuty detects threat activity.', d: 'Inspector finds software vulnerabilities.' },
    tags: ['aws-config','compliance'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccp-q-041', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-shared-resp',
    q: 'Which AWS service uses machine learning to detect unusual API activity, cryptocurrency mining, and unauthorized access attempts?',
    a: [['a','AWS Config'],['b','Amazon Macie'],['c','Amazon GuardDuty', true],['d','AWS Trusted Advisor']],
    why: 'GuardDuty is a threat-detection service that analyzes CloudTrail, VPC Flow Logs, and DNS logs using ML to detect malicious behavior.',
    wrong: { b: 'Macie detects sensitive data (PII) in S3 using ML.' },
    tags: ['guardduty','threat-detection'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccp-q-042', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-shared-resp',
    q: 'A company wants DDoS protection for their public-facing web application. Which AWS service provides this automatically at no extra cost?',
    a: [['a','AWS WAF'],['b','AWS Shield Standard', true],['c','AWS Shield Advanced'],['d','Amazon GuardDuty']],
    why: 'AWS Shield Standard is automatically included at no cost for all AWS customers and protects against common L3/L4 DDoS attacks.',
    trap: 'Shield Advanced costs extra but adds 24/7 DDoS response team access, cost protection, and L7 protection via WAF integration.',
    tags: ['shield','ddos'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-043', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-shared-resp',
    q: 'A company needs to protect their web application from SQL injection and cross-site scripting attacks. Which AWS service should they use?',
    a: [['a','AWS Shield'],['b','Amazon GuardDuty'],['c','AWS WAF (Web Application Firewall)', true],['d','AWS Network Firewall']],
    why: 'AWS WAF inspects HTTP/HTTPS requests and applies rules to block common web exploits like SQL injection and XSS at Layer 7.',
    tags: ['waf','web-security'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-044', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-iam',
    q: 'Which AWS service creates and manages the encryption keys used to protect data at rest in services like S3, RDS, and EBS?',
    a: [['a','AWS Secrets Manager'],['b','AWS Certificate Manager'],['c','AWS KMS (Key Management Service)', true],['d','AWS IAM']],
    why: 'KMS creates, rotates, and controls access to customer master keys (CMKs) used for encryption across AWS services.',
    wrong: { a: 'Secrets Manager stores database passwords and API keys.', b: 'ACM manages TLS/SSL certificates.' },
    tags: ['kms','encryption'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccp-q-045', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-iam',
    q: 'A developer needs to store and automatically rotate database credentials for an application. Which service is purpose-built for this?',
    a: [['a','AWS KMS'],['b','AWS Secrets Manager', true],['c','AWS Systems Manager Parameter Store'],['d','Amazon S3 with encryption']],
    why: 'Secrets Manager stores secrets (passwords, API keys) and natively supports automatic rotation for supported services like RDS.',
    trap: 'Parameter Store can store secrets too (with SecureString), but Secrets Manager is the purpose-built answer for rotation.',
    tags: ['secrets-manager','rotation'], difficulty: 'medium', time: 50 }),

  q({ id: 'ccp-q-046', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-iam',
    q: 'Which VPC resource controls inbound and outbound traffic at the subnet level and is stateless?',
    a: [['a','Security Group'],['b','Network ACL (NACL)', true],['c','Internet Gateway'],['d','NAT Gateway']],
    why: 'NACLs are stateless subnet-level firewalls — return traffic must be explicitly permitted. Security groups are stateful and operate at the instance level.',
    trap: 'Security groups are stateful (return traffic is automatic). NACLs are stateless (you need explicit rules for both directions).',
    tags: ['nacl','vpc','security-group'], difficulty: 'hard', time: 60 }),

  q({ id: 'ccp-q-047', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-shared-resp',
    q: 'A company needs to demonstrate HIPAA compliance for their healthcare application on AWS. What does AWS provide to help?',
    a: [
      ['a','AWS automatically ensures HIPAA compliance for all services'],
      ['b','AWS compliance programs show which services are HIPAA-eligible, and customers sign a BAA', true],
      ['c','AWS handles all HIPAA requirements so the customer has no responsibility'],
      ['d','HIPAA compliance is not possible on public cloud']
    ],
    why: 'AWS publishes which services are HIPAA-eligible and offers a Business Associate Agreement (BAA). Customers are still responsible for their data handling and configuration.',
    tags: ['compliance','hipaa'], difficulty: 'hard', time: 55 }),

  q({ id: 'ccp-q-048', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-shared-resp',
    q: 'Which AWS service aggregates security findings from GuardDuty, Inspector, and Macie into a single dashboard?',
    a: [['a','AWS CloudTrail'],['b','Amazon Detective'],['c','AWS Security Hub', true],['d','AWS Config']],
    why: 'Security Hub provides a centralized view of security findings across AWS services and third-party integrations, with compliance checks against standards like CIS.',
    tags: ['security-hub','compliance'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccp-q-049', certId: C, examCode: E, domainId: 'ccp-security', objectiveId: 'ccp-obj-iam',
    q: 'An IAM user belongs to a group with an attached policy granting S3 full access. The user also has a separate policy denying S3 ListBucket. What is the effective permission?',
    a: [
      ['a','Full S3 access because group permissions take precedence'],
      ['b','S3 ListBucket is denied; all other S3 actions are allowed', true],
      ['c','No S3 access because any deny removes all access'],
      ['d','Full S3 access because user policies override group policies']
    ],
    why: 'Explicit Deny overrides Allow for that specific action. The user gets full S3 access EXCEPT ListBucket, which is explicitly denied.',
    trap: 'Explicit Deny only blocks the denied action — it does not remove all permissions. Only the specific action is denied.',
    tags: ['iam','policy-evaluation'], difficulty: 'exam_level', time: 75 }),

  // ── TECHNOLOGY AND SERVICES (15 new) ─────────────────────────────────────

  q({ id: 'ccp-q-050', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'A company stores compliance documents that are rarely accessed. They need the lowest storage cost with retrieval within 12 hours. Which S3 storage class is MOST appropriate?',
    a: [['a','S3 Standard-IA'],['b','S3 Glacier Instant Retrieval'],['c','S3 Glacier Deep Archive', true],['d','S3 One Zone-IA']],
    why: 'S3 Glacier Deep Archive is the cheapest S3 class, designed for data accessed once or twice a year with retrieval times of 12 hours (standard) or 48 hours (bulk).',
    wrong: { a: 'Standard-IA retrieves in milliseconds but costs more per GB.', b: 'Glacier Instant retrieves in milliseconds — for data accessed a few times per year, not once per year.' },
    tags: ['s3','glacier','storage-class'], difficulty: 'medium', time: 50 }),

  q({ id: 'ccp-q-051', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'A company wants to automatically move S3 objects between storage tiers based on changing access patterns without writing lifecycle rules. Which storage class does this?',
    a: [['a','S3 Standard-IA'],['b','S3 One Zone-IA'],['c','S3 Intelligent-Tiering', true],['d','S3 Glacier']],
    why: 'S3 Intelligent-Tiering automatically moves objects between access tiers (Frequent, Infrequent, Archive) based on actual usage — no retrieval fees and no manual rules.',
    tags: ['s3','intelligent-tiering'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccp-q-052', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'Which AWS service distributes content globally from edge locations to reduce latency for end users?',
    a: [['a','Amazon Route 53'],['b','AWS Direct Connect'],['c','Amazon CloudFront', true],['d','AWS Global Accelerator']],
    why: 'CloudFront is AWS\'s CDN — it caches content at 400+ edge locations worldwide, reducing latency and origin server load.',
    wrong: { a: 'Route 53 is DNS with latency-based routing but not a CDN.', d: 'Global Accelerator optimizes routing to AWS resources using the AWS backbone, not a CDN.' },
    tags: ['cloudfront','cdn'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-053', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'A company wants to host a NoSQL database that handles millions of reads and writes per second with single-digit millisecond latency. Which AWS service is BEST?',
    a: [['a','Amazon RDS'],['b','Amazon Redshift'],['c','Amazon DynamoDB', true],['d','Amazon Aurora']],
    why: 'DynamoDB is a fully managed NoSQL key-value and document database designed for high-scale, low-latency workloads.',
    wrong: { a: 'RDS is relational.', b: 'Redshift is a data warehouse for analytics.', d: 'Aurora is a high-performance relational database.' },
    tags: ['dynamodb','nosql'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-054', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'A company uses RDS but experiences slow database reads due to repeated identical queries. Which service adds an in-memory caching layer to improve performance?',
    a: [['a','DynamoDB Accelerator (DAX)'],['b','Amazon ElastiCache', true],['c','Amazon CloudFront'],['d','AWS Lambda']],
    why: 'ElastiCache (Redis or Memcached) provides in-memory caching for relational databases, reducing read latency and database load for repeated queries.',
    trap: 'DAX is specifically for DynamoDB. ElastiCache is for RDS/relational database query caching.',
    tags: ['elasticache','caching'], difficulty: 'medium', time: 50 }),

  q({ id: 'ccp-q-055', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'A company wants to send notifications to multiple subscribers (email, SMS, Lambda functions) when an event occurs. Which AWS service handles this fan-out pattern?',
    a: [['a','Amazon SQS'],['b','Amazon SNS', true],['c','Amazon EventBridge'],['d','AWS Step Functions']],
    why: 'SNS (Simple Notification Service) is a pub/sub service that pushes messages to multiple endpoints simultaneously — the fan-out pattern.',
    trap: 'SQS queues messages for a single consumer. SNS pushes to multiple subscribers. Both are often used together (SNS → multiple SQS queues).',
    tags: ['sns','sqs','messaging'], difficulty: 'medium', time: 50 }),

  q({ id: 'ccp-q-056', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'Which AWS service allows you to define and provision cloud infrastructure using templates (JSON or YAML)?',
    a: [['a','AWS Elastic Beanstalk'],['b','AWS CloudFormation', true],['c','AWS OpsWorks'],['d','AWS Systems Manager']],
    why: 'CloudFormation is AWS\'s Infrastructure as Code (IaC) service — templates describe resources and CloudFormation provisions them consistently.',
    tags: ['cloudformation','iac'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-057', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'Which service provides metrics, alarms, and dashboards for monitoring AWS resources and applications?',
    a: [['a','AWS CloudTrail'],['b','Amazon CloudWatch', true],['c','AWS Config'],['d','AWS X-Ray']],
    why: 'CloudWatch collects and tracks metrics, creates alarms, and visualizes data — the primary monitoring service for AWS infrastructure and application performance.',
    tags: ['cloudwatch','monitoring'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-058', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'Which AWS load balancer type operates at Layer 7 and routes based on HTTP path or host headers?',
    a: [['a','Network Load Balancer (NLB)'],['b','Classic Load Balancer (CLB)'],['c','Application Load Balancer (ALB)', true],['d','Gateway Load Balancer (GWLB)']],
    why: 'ALB operates at Layer 7 (HTTP/HTTPS) and supports path-based routing (/api → API servers), host-based routing, and WebSocket.',
    trap: 'NLB operates at Layer 4 (TCP/UDP) for ultra-low latency. ALB is Layer 7 for content-based routing.',
    tags: ['alb','load-balancer'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccp-q-059', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'A company needs a dedicated private network connection from their data center to AWS with consistent bandwidth and lower latency than VPN. Which service provides this?',
    a: [['a','AWS VPN'],['b','AWS Direct Connect', true],['c','AWS Transit Gateway'],['d','Amazon VPC Peering']],
    why: 'Direct Connect is a dedicated physical network connection between on-premises and AWS — consistent throughput, lower latency, no internet variability.',
    trap: 'AWS VPN is encrypted but goes over the public internet. Direct Connect bypasses the internet entirely for a dedicated line.',
    tags: ['direct-connect','vpn'], difficulty: 'medium', time: 45 }),

  q({ id: 'ccp-q-060', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'Which tool provides a curated marketplace of third-party software, SaaS, and data products that can be deployed directly into your AWS environment?',
    a: [['a','AWS Service Catalog'],['b','AWS Marketplace', true],['c','AWS Solutions Library'],['d','AWS Partner Network']],
    why: 'AWS Marketplace is an online store where customers find, subscribe to, and deploy third-party software running on AWS.',
    tags: ['aws-marketplace'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-061', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'A company\'s application requires scaling EC2 instances out during business hours and in overnight. Which service automates this?',
    a: [['a','AWS Lambda'],['b','Amazon EC2 Auto Scaling', true],['c','AWS Elastic Beanstalk'],['d','Amazon CloudWatch']],
    why: 'EC2 Auto Scaling groups automatically launch or terminate instances based on scheduled actions, demand metrics, or health checks.',
    wrong: { d: 'CloudWatch triggers alarms but Auto Scaling acts on them.' },
    tags: ['auto-scaling','ec2'], difficulty: 'easy', time: 30 }),

  q({ id: 'ccp-q-062', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'Which AWS service provides status information about AWS services and incidents affecting specific AWS accounts?',
    a: [
      ['a','AWS Service Health Dashboard (public)'],
      ['b','AWS Personal Health Dashboard', true],
      ['c','Amazon CloudWatch'],
      ['d','AWS Trusted Advisor']
    ],
    why: 'AWS Personal Health Dashboard (now called AWS Health) shows events that may affect your specific resources and accounts, unlike the public Service Health Dashboard which shows general AWS status.',
    trap: 'Service Health Dashboard is public and shows global AWS status. Personal Health Dashboard is account-specific and shows YOUR resources\' exposure to events.',
    tags: ['health-dashboard','operations'], difficulty: 'medium', time: 50 }),

  q({ id: 'ccp-q-063', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'A company wants to run containerized workloads without managing the underlying servers or clusters. Which combination of services achieves this?',
    a: [
      ['a','EC2 + Docker installed manually'],
      ['b','ECS or EKS with AWS Fargate', true],
      ['c','AWS Lambda only'],
      ['d','Amazon Lightsail']
    ],
    why: 'Fargate is the serverless compute engine for containers — ECS or EKS manages orchestration while Fargate removes the need to manage EC2 instances or node groups.',
    tags: ['fargate','ecs','containers'], difficulty: 'hard', time: 55 }),

  q({ id: 'ccp-q-064', certId: C, examCode: E, domainId: 'ccp-tech', objectiveId: 'ccp-obj-core-services',
    q: 'Which Route 53 routing policy sends traffic to the resource with the lowest network latency for the end user?',
    a: [['a','Simple routing'],['b','Failover routing'],['c','Weighted routing'],['d','Latency-based routing', true]],
    why: 'Latency-based routing directs users to the AWS Region that provides the lowest latency for their location.',
    tags: ['route53','routing-policy'], difficulty: 'medium', time: 45 }),

  // ── BILLING (1 new) ───────────────────────────────────────────────────────

  q({ id: 'ccp-q-065', certId: C, examCode: E, domainId: 'ccp-billing', objectiveId: 'ccp-obj-pricing',
    q: 'A finance team wants to see which AWS services are driving the most cost and filter by department using tags. Which tool provides this analysis?',
    a: [['a','AWS Pricing Calculator'],['b','AWS Budgets'],['c','AWS Cost Explorer', true],['d','AWS Trusted Advisor']],
    why: 'Cost Explorer visualizes historical and current AWS spending, allows filtering and grouping by tags (cost allocation tags), and identifies cost drivers.',
    wrong: { a: 'Pricing Calculator estimates future costs.', b: 'Budgets sets thresholds and alerts.', d: 'Trusted Advisor gives optimization recommendations but not tag-based cost breakdowns.' },
    tags: ['cost-explorer','billing'], difficulty: 'medium', time: 45 }),
];

export const sideQuests = [{
  id: 'ccp-quest-services', certId: CERT_ID, objectiveId: 'ccp-obj-core-services',
  template: 'cable_crafter' as const,
  title: 'The Cloud Village Service Match',
  story: 'A new villager arrives and points at each building, asking what each one does. Match the AWS service to its purpose.',
  payload: {
    passThreshold: 80,
    items: [
      { id: 'i1', label: 'Object storage with 11 9s durability', answer: 'S3', distractors: ['EBS', 'EFS', 'Glacier'] },
      { id: 'i2', label: 'Managed relational database', answer: 'RDS', distractors: ['DynamoDB', 'Redshift', 'Neptune'] },
      { id: 'i3', label: 'Serverless functions billed per ms', answer: 'Lambda', distractors: ['EC2', 'Fargate', 'Batch'] },
      { id: 'i4', label: 'Virtual servers (IaaS)', answer: 'EC2', distractors: ['Lambda', 'Lightsail', 'Outposts'] },
      { id: 'i5', label: 'Isolated network within AWS', answer: 'VPC', distractors: ['Direct Connect', 'Transit Gateway', 'PrivateLink'] },
    ],
  },
}];

export const bossBattles = [{
  id: 'ccp-boss-architect', certId: CERT_ID, objectiveIds: ['ccp-obj-shared-resp','ccp-obj-iam','ccp-obj-core-services'],
  title: 'The Migration Briefing',
  storySetup: 'A non-technical executive asks you to explain why moving their on-prem app to AWS is safe and cost-effective. They are skeptical of the cloud.',
  scenario: 'In your own words: explain the Shared Responsibility Model so they understand who handles what. Explain how IAM roles are safer than the keys their developers currently email each other. Explain which AWS services map to their existing on-prem setup (database, web server, file storage). Recommend a pricing model for their predictable production workload.',
  constraints: ['Audience is non-technical', 'Time-boxed to a 15-minute briefing', 'Must address security concerns directly'],
  rubric: {
    passThreshold: 75,
    dimensions: [
      { key: 'shared_resp_clarity', weight: 0.30, description: 'Did you explain the Shared Responsibility Model in plain language?' },
      { key: 'iam_explanation', weight: 0.25, description: 'Did you make IAM roles versus keys understandable to a non-technical audience?' },
      { key: 'service_mapping', weight: 0.25, description: 'Did you correctly map on-prem components to AWS services?' },
      { key: 'pricing_recommendation', weight: 0.20, description: 'Was your pricing recommendation appropriate for the workload?' },
    ],
  },
  remediation: { shared_resp_clarity: ['ccp-fc-001','ccp-fc-002'], iam_explanation: ['ccp-fc-005','ccp-fc-007'], service_mapping: ['ccp-fc-009','ccp-fc-010','ccp-fc-011'], pricing_recommendation: ['ccp-fc-016','ccp-fc-017'] },
}];

export const practiceExams = [{
  id: 'ccp-mini-exam', certId: CERT_ID, examCode: EXAM_CODE,
  title: 'AWS CCP Mini Practice Exam', mode: 'mini' as const,
  questionCount: 10, timeLimitSeconds: 15 * 60,
  passingScaledScore: 700, scaledScoreMax: 1000, scaledScoreMin: 100,
  domainTargets: [
    { domainId: 'ccp-concepts', questionCount: 2 },
    { domainId: 'ccp-security', questionCount: 3 },
    { domainId: 'ccp-tech', questionCount: 4 },
    { domainId: 'ccp-billing', questionCount: 1 },
  ],
  difficultyMix: { easy: 0.3, medium: 0.5, hard: 0.20, exam_level: 0.0 },
  unlockRequirements: { minReadiness: 0, minDomainReadiness: 0, requiredBossBattlesPassed: [], minQuizAttempts: 0, requiresPriorPracticeExamPass: false },
  allowManualOverride: true,
}, {
  id: 'ccp-full-exam', certId: CERT_ID, examCode: EXAM_CODE,
  title: 'AWS CCP Full Practice Exam', mode: 'full' as const,
  questionCount: 65, timeLimitSeconds: 90 * 60,
  passingScaledScore: 700, scaledScoreMax: 1000, scaledScoreMin: 100,
  domainTargets: [
    { domainId: 'ccp-concepts', questionCount: 16 },
    { domainId: 'ccp-security', questionCount: 20 },
    { domainId: 'ccp-tech', questionCount: 22 },
    { domainId: 'ccp-billing', questionCount: 7 },
  ],
  difficultyMix: { easy: 0.25, medium: 0.5, hard: 0.20, exam_level: 0.05 },
  unlockRequirements: { minReadiness: 80, minDomainReadiness: 65, requiredBossBattlesPassed: ['ccp-boss-architect'], minQuizAttempts: 3, requiresPriorPracticeExamPass: false },
  allowManualOverride: true,
}];

export const glossary = [
  { term: 'AZ', definition: 'Availability Zone — one or more discrete data centers within an AWS Region.' },
  { term: 'IAM', definition: 'Identity and Access Management — AWS service for managing users, groups, roles, and permissions.' },
  { term: 'VPC', definition: 'Virtual Private Cloud — your isolated network within AWS.' },
  { term: 'TCO', definition: 'Total Cost of Ownership — the full cost of owning and operating infrastructure, including hardware, power, cooling, and staff.' },
];

export const acronyms = [
  { acronym: 'EC2', expansion: 'Elastic Compute Cloud', meaning: 'AWS virtual server service.' },
  { acronym: 'RDS', expansion: 'Relational Database Service', meaning: 'AWS managed relational database service.' },
  { acronym: 'SLA', expansion: 'Service Level Agreement', meaning: 'A commitment from a service provider about uptime, performance, or availability.' },
];

export const examTraps = [
  { trap: 'Shared Responsibility scope', explanation: 'For managed services like RDS, AWS patches the engine. For EC2, the customer patches the OS. The line moves with the service tier.' },
  { trap: 'Spot vs Reserved', explanation: 'Spot for fault-tolerant workloads, Reserved/Savings Plans for predictable steady-state. Do not mix these up.' },
];
