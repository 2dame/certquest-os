/**
 * AWS Certified Solutions Architect — Associate (SAA-C03) — Architect Trials theme.
 */

import { q, fc } from '../../authoring';
import { awsSaaLore } from '../../lore/aws-saa';

export const CERT_ID = 'aws-saa';
export const EXAM_CODE = 'SAA-C03';

export const meta = {
  id: CERT_ID, provider: 'aws' as const,
  examName: 'AWS Certified Solutions Architect - Associate', examCode: EXAM_CODE,
  examVersion: 'verify-before-publish',
  officialSourceUrl: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
  lastVerifiedDate: '2026-05-01',
  themeName: 'Architect Trials',
  themeBlurb: 'A series of trials. Each one is a real architecture decision under constraints. Survive enough trials and you earn the title.',
  displayOrder: 5,
  lore: awsSaaLore,
};

export const examCodes = [{
  examCode: EXAM_CODE, examName: 'AWS Certified Solutions Architect - Associate',
  scaledScoreMin: 100, scaledScoreMax: 1000, passingScaledScore: 720,
  questionCount: 65, timeLimitMinutes: 130,
}];

export const domains = [
  { id: 'saa-secure', certId: CERT_ID, title: 'Design Secure Architectures', blurb: 'IAM, encryption, network security, data protection.', weight: 0.30, displayOrder: 1 },
  { id: 'saa-resilient', certId: CERT_ID, title: 'Design Resilient Architectures', blurb: 'Multi-tier, decoupled, fault-tolerant designs.', weight: 0.26, displayOrder: 2 },
  { id: 'saa-perf', certId: CERT_ID, title: 'Design High-Performing Architectures', blurb: 'Compute, storage, networking, database performance.', weight: 0.24, displayOrder: 3 },
  { id: 'saa-cost', certId: CERT_ID, title: 'Design Cost-Optimized Architectures', blurb: 'Right-sizing, lifecycle policies, reserved capacity.', weight: 0.20, displayOrder: 4 },
];

export const objectives = [
  { id: 'saa-obj-ha', certId: CERT_ID, domainId: 'saa-resilient', title: 'High Availability and Multi-AZ', difficulty: 'intermediate', estimatedMinutes: 30, prerequisites: [], concepts: ['multi-AZ RDS', 'ELB', 'Auto Scaling', 'Route 53 health checks'], masteryCriteria: { minQuizScore: 80, requiredReviews: 5, requiredBossBattles: 1, requiresSelfExplanation: true }, displayOrder: 1 },
  { id: 'saa-obj-decoupling', certId: CERT_ID, domainId: 'saa-resilient', title: 'Decoupling with SQS, SNS, EventBridge', difficulty: 'intermediate', estimatedMinutes: 25, prerequisites: [], concepts: ['async messaging', 'fan-out', 'dead letter queues'], masteryCriteria: { minQuizScore: 75, requiredReviews: 4, requiredBossBattles: 0, requiresSelfExplanation: true }, displayOrder: 2 },
  { id: 'saa-obj-storage', certId: CERT_ID, domainId: 'saa-perf', title: 'Storage Service Selection', difficulty: 'intermediate', estimatedMinutes: 25, prerequisites: [], concepts: ['S3 classes', 'EBS types', 'EFS', 'FSx'], masteryCriteria: { minQuizScore: 75, requiredReviews: 4, requiredBossBattles: 0, requiresSelfExplanation: true }, displayOrder: 3 },
  { id: 'saa-obj-iam-advanced', certId: CERT_ID, domainId: 'saa-secure', title: 'IAM Policies and Cross-Account Access', difficulty: 'advanced', estimatedMinutes: 30, prerequisites: [], concepts: ['policy types', 'policy evaluation', 'STS', 'cross-account roles'], masteryCriteria: { minQuizScore: 80, requiredReviews: 5, requiredBossBattles: 1, requiresSelfExplanation: true }, displayOrder: 4 },
];

export const lessons = [
  {
    id: 'saa-lesson-ha', certId: CERT_ID, objectiveId: 'saa-obj-ha',
    title: 'High Availability Patterns', estimatedMinutes: 11,
    loreIntro: {
      scene: 'You arrive at Multi-AZ Fortress. Master Well-Arch is already there, waiting.',
      mentorMessage: 'This region\'s threat: single points of failure. Today\'s training: High Availability Patterns. Pay attention — the field will test you on this.',
      missionObjective: 'Master the concepts in High Availability Patterns so you can identify and resolve single points of failure on sight.',
    },
    blocks: [
      { kind: 'intro', body: 'High availability is about removing single points of failure. The exam will give you a scenario and ask which AWS feature solves it.' },
      { kind: 'concept', body: 'Multi-AZ for RDS: synchronous standby in another AZ, automatic failover. Read replicas: async, for read scaling not failover. ELB across AZs: distributes traffic, removes server SPOF. Auto Scaling: replaces failed instances, scales to load. Route 53 with health checks: failover at the DNS layer.' },
      { kind: 'decision_table', body: 'Need automatic failover for a database? → Multi-AZ RDS. Need to scale reads? → Read Replicas. Need to survive an entire Region failure? → Cross-Region replication + Route 53 failover. Need stateless web tier resilience? → ELB + Auto Scaling across multiple AZs.' },
      { kind: 'common_mistake', body: 'Confusing Multi-AZ with Read Replicas. Multi-AZ is for HA. Read Replicas are for read scaling. They are different features that solve different problems.' },
    ],
  },
  {
    id: 'saa-lesson-decoupling', certId: CERT_ID, objectiveId: 'saa-obj-decoupling',
    title: 'Decoupling Tiers', estimatedMinutes: 9,
    loreIntro: {
      scene: 'You arrive at Multi-AZ Fortress. Master Well-Arch is already there, waiting.',
      mentorMessage: 'This region\'s threat: single points of failure. Today\'s training: Decoupling Tiers. Pay attention — the field will test you on this.',
      missionObjective: 'Master the concepts in Decoupling Tiers so you can identify and resolve single points of failure on sight.',
    },
    blocks: [
      { kind: 'intro', body: 'Decoupling is the architectural move that buys you scalability and resilience for free.' },
      { kind: 'concept', body: 'SQS: queues — one producer, one consumer per message, durable, supports DLQs for poisoned messages. SNS: pub/sub — one publisher, many subscribers (fan-out). EventBridge: event bus — pattern-matching to route events to many targets, supports schedules and SaaS integrations.' },
      { kind: 'analogy', body: 'SQS is a single-line queue at the bank. SNS is a megaphone announcing to a crowd. EventBridge is a smart switchboard that routes messages by content.' },
      { kind: 'scenario', body: 'A photo upload triggers a thumbnail generator AND a virus scanner AND a notification. Use SNS to fan out the upload event to three subscribers (or EventBridge if you want filtering/scheduling).' },
    ],
  },
  {
    id: 'saa-lesson-storage', certId: CERT_ID, objectiveId: 'saa-obj-storage',
    title: 'Picking the Right Storage', estimatedMinutes: 10,
    loreIntro: {
      scene: 'You arrive at Auto Scaling Arena. Master Well-Arch is already there, waiting.',
      mentorMessage: 'This region\'s threat: static fleets and wrong instance families. Today\'s training: Picking the Right Storage. Pay attention — the field will test you on this.',
      missionObjective: 'Master the concepts in Picking the Right Storage so you can identify and resolve static fleets and wrong instance families on sight.',
    },
    blocks: [
      { kind: 'intro', body: 'Storage selection questions are 20% of the exam. The exam wants you to match access pattern to service.' },
      { kind: 'decision_table', body: 'Object storage, durable, web-accessible? → S3. Block storage attached to one EC2? → EBS. Shared file system, NFS, multi-EC2? → EFS. Windows shared file system? → FSx for Windows. High-performance HPC? → FSx for Lustre. Object archive, hours-to-retrieve? → Glacier Deep Archive.' },
      { kind: 'concept', body: 'EBS volume types: gp3 (general purpose, configurable IOPS), io2 (high IOPS for databases), st1 (throughput-optimized HDD), sc1 (cold HDD).' },
      { kind: 'common_mistake', body: 'Choosing EBS for a multi-EC2 shared filesystem. EBS attaches to one instance (multi-attach has limited use). Use EFS or FSx for shared files.' },
    ],
  },
];

const C = CERT_ID;

export const flashcards = [
  fc('saa-fc-001', C, 'saa-resilient', 'saa-obj-ha', 'What does Multi-AZ RDS provide?', 'Synchronous standby in another AZ with automatic failover for high availability. Not for read scaling.', 'basic'),
  fc('saa-fc-002', C, 'saa-resilient', 'saa-obj-ha', 'When to use RDS Read Replicas?', 'Read scaling. Replicas are async. Not for HA failover (use Multi-AZ for that).', 'basic'),
  fc('saa-fc-003', C, 'saa-resilient', 'saa-obj-ha', 'Which load balancer is Layer 7 (HTTP/HTTPS)?', 'Application Load Balancer (ALB). NLB is Layer 4.', 'basic'),
  fc('saa-fc-004', C, 'saa-resilient', 'saa-obj-ha', 'Which load balancer handles millions of requests/sec at low latency?', 'Network Load Balancer (NLB) at Layer 4.', 'basic'),
  fc('saa-fc-005', C, 'saa-resilient', 'saa-obj-decoupling', 'When to use SQS vs SNS?', 'SQS when one consumer processes each message. SNS when you want fan-out to multiple subscribers.', 'basic'),
  fc('saa-fc-006', C, 'saa-resilient', 'saa-obj-decoupling', 'What is a Dead Letter Queue (DLQ)?', 'A secondary queue that receives messages a consumer fails to process after N attempts. Lets you debug bad messages without blocking the main queue.', 'basic'),
  fc('saa-fc-007', C, 'saa-resilient', 'saa-obj-decoupling', 'When to use EventBridge over SNS?', 'When you need content-based routing, schedules, or SaaS event integrations. EventBridge is more powerful but slightly higher latency.', 'basic'),
  fc('saa-fc-008', C, 'saa-perf', 'saa-obj-storage', 'EBS gp3 vs gp2?', 'gp3 lets you provision IOPS and throughput independently of size. Cheaper and more flexible than gp2.', 'basic'),
  fc('saa-fc-009', C, 'saa-perf', 'saa-obj-storage', 'EBS io2 use case?', 'Databases needing sustained high IOPS (>16,000) with high durability.', 'basic'),
  fc('saa-fc-010', C, 'saa-perf', 'saa-obj-storage', 'EFS vs FSx for Windows?', 'EFS is Linux/NFS. FSx for Windows is SMB and integrates with Active Directory.', 'basic'),
  fc('saa-fc-011', C, 'saa-perf', 'saa-obj-storage', 'S3 Intelligent-Tiering use case?', 'Unknown or changing access patterns. Automatically moves objects between tiers based on access.', 'basic'),
  fc('saa-fc-012', C, 'saa-perf', 'saa-obj-storage', 'S3 Glacier vs Glacier Deep Archive?', 'Glacier: minutes to hours retrieval. Deep Archive: hours to 12 hours retrieval, cheapest tier.', 'basic'),
  fc('saa-fc-013', C, 'saa-secure', 'saa-obj-iam-advanced', 'Identity-based policy vs resource-based policy?', 'Identity-based: attached to a user/group/role and grants permissions to that identity. Resource-based: attached to a resource (like an S3 bucket) and grants access TO that resource.', 'basic'),
  fc('saa-fc-014', C, 'saa-secure', 'saa-obj-iam-advanced', 'How does AWS evaluate IAM policies?', 'Explicit deny wins. Then explicit allow. Default is deny.', 'basic'),
  fc('saa-fc-015', C, 'saa-secure', 'saa-obj-iam-advanced', 'STS use case?', 'Security Token Service issues temporary credentials, used for cross-account access, federation, and EC2 instance roles.', 'basic'),
  fc('saa-fc-016', C, 'saa-secure', 'saa-obj-iam-advanced', 'Cross-account role pattern?', 'Account A creates a role with a trust policy allowing Account B. User in B assumes the role via STS to access A\'s resources.', 'basic'),
  fc('saa-fc-017', C, 'saa-cost', 'saa-obj-storage', 'How to reduce S3 costs for data accessed less often over time?', 'S3 Lifecycle policy moving objects to Standard-IA, then Glacier, then Deep Archive based on age.', 'basic'),
  fc('saa-fc-018', C, 'saa-cost', 'saa-obj-ha', 'Cheapest way to run a web tier behind ELB?', 'Auto Scaling group across AZs with Spot Instances mixed with On-Demand baseline.', 'basic'),
  fc('saa-fc-019', C, 'saa-resilient', 'saa-obj-ha', 'How does Route 53 failover work?', 'Health checks monitor endpoints. If primary fails, DNS responses change to point to a secondary endpoint.', 'basic'),
  fc('saa-fc-020', C, 'saa-resilient', 'saa-obj-decoupling', 'Maximum SQS message size?', '256 KB. For larger messages, use S3 with the SQS Extended Client (or send a pointer).', 'basic'),
];

const E = EXAM_CODE;

export const questionBank = [
  q({ id: 'saa-q-001', certId: C, examCode: E, domainId: 'saa-resilient', objectiveId: 'saa-obj-ha',
    q: 'A company runs a critical RDS MySQL database. They need automatic failover if the AZ fails AND read scaling for reporting queries. What architecture meets BOTH needs?',
    a: [
      ['a','Single AZ RDS with three Read Replicas'],
      ['b','Multi-AZ RDS with one or more Read Replicas in other AZs', true],
      ['c','Multi-AZ RDS only'],
      ['d','Read Replicas in three AZs only']
    ],
    why: 'Multi-AZ provides failover. Read Replicas provide read scaling. Combine them for both.',
    wrong: { a: 'No Multi-AZ means no automatic failover.', c: 'No Read Replicas means no read scaling.', d: 'Read Replicas alone do not provide synchronous failover.' },
    tags: ['rds','multi-az','read-replicas'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-002', certId: C, examCode: E, domainId: 'saa-resilient', objectiveId: 'saa-obj-decoupling',
    q: 'A company needs to send the same order event to three downstream services: inventory, billing, and analytics. Which service is BEST?',
    a: [['a','SQS standard queue'],['b','SQS FIFO queue'],['c','SNS topic with three subscribers', true],['d','RDS trigger']],
    why: 'SNS fan-out delivers each message to all subscribers. SQS delivers each message to one consumer.',
    wrong: { a: 'SQS is one-to-one delivery.', b: 'SQS FIFO is also one-to-one.', d: 'RDS triggers are not for inter-service messaging.' },
    tags: ['sns','decoupling','fan-out'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-003', certId: C, examCode: E, domainId: 'saa-perf', objectiveId: 'saa-obj-storage',
    q: 'A team has a Linux-based application that needs a shared file system mountable by 50 EC2 instances simultaneously. Which service is appropriate?',
    a: [['a','EBS gp3'],['b','EFS', true],['c','FSx for Windows'],['d','S3']],
    why: 'EFS is a shared NFS filesystem mountable by many instances. EBS is single-instance. FSx for Windows is SMB.',
    tags: ['efs','shared-storage'], difficulty: 'easy', time: 45 }),

  q({ id: 'saa-q-004', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'An IAM user has both an identity-based policy that ALLOWS S3:GetObject and a resource-based policy on a bucket that DENIES it. What happens when the user tries to read the object?',
    a: [
      ['a','Allowed (identity policy wins)'],
      ['b','Allowed (most-recent policy wins)'],
      ['c','Denied (explicit deny always wins)', true],
      ['d','The request is logged but allowed']
    ],
    why: 'Explicit deny in any applicable policy overrides any allow. This is a high-frequency exam topic.',
    tags: ['iam','policy-evaluation'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-005', certId: C, examCode: E, domainId: 'saa-resilient', objectiveId: 'saa-obj-ha',
    q: 'A web application must remain available even if an entire AWS Region becomes unreachable. What is the MOST appropriate strategy?',
    a: [
      ['a','Multi-AZ deployment in one Region'],
      ['b','Auto Scaling across multiple AZs in one Region'],
      ['c','Active-active or active-passive deployment in two Regions with Route 53 failover', true],
      ['d','Daily snapshots']
    ],
    why: 'Region-level failure requires multi-Region architecture. Multi-AZ does not protect against Region outages.',
    tags: ['multi-region','dr','route53'], difficulty: 'hard', time: 60 }),

  q({ id: 'saa-q-006', certId: C, examCode: E, domainId: 'saa-perf', objectiveId: 'saa-obj-storage',
    q: 'A workload requires unpredictable burst access to data that may sit untouched for months at a time. Which S3 storage class is MOST cost-effective without sacrificing availability?',
    a: [
      ['a','S3 Standard'],
      ['b','S3 Intelligent-Tiering', true],
      ['c','S3 Glacier Flexible Retrieval'],
      ['d','S3 One Zone-IA']
    ],
    why: 'Intelligent-Tiering automatically moves objects between frequent and infrequent access tiers based on access patterns. Best for unpredictable workloads.',
    tags: ['s3','intelligent-tiering'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-007', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'A third-party SaaS vendor needs read-only access to a specific S3 bucket in your account. What is the MOST secure way to grant this?',
    a: [
      ['a','Create an IAM user, give them access keys, email them'],
      ['b','Make the bucket public'],
      ['c','Create a cross-account IAM role they assume via STS, with read-only policy and external ID', true],
      ['d','Email them the bucket policy']
    ],
    why: 'Cross-account roles with STS and external ID are the secure pattern for third-party access. No long-term credentials are exposed.',
    tags: ['cross-account','sts','third-party'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-008', certId: C, examCode: E, domainId: 'saa-cost', objectiveId: 'saa-obj-storage',
    q: 'A company has 50 TB of log data that is analyzed only quarterly. Retrieval can take hours. Which storage class is MOST cost-effective?',
    a: [
      ['a','S3 Standard'],
      ['b','S3 Standard-IA'],
      ['c','S3 Glacier Flexible Retrieval'],
      ['d','S3 Glacier Deep Archive', true]
    ],
    why: 'Quarterly access with hours-of-retrieval tolerance fits Deep Archive — the cheapest S3 class.',
    tags: ['s3','glacier','cost-optimization'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-009', certId: C, examCode: E, domainId: 'saa-resilient', objectiveId: 'saa-obj-decoupling',
    q: 'A processing job sometimes fails due to malformed input. Failed messages should be removed from the main queue for separate inspection. What feature handles this?',
    a: [['a','SQS visibility timeout'],['b','SQS Dead Letter Queue', true],['c','SQS long polling'],['d','SNS retry policy']],
    why: 'DLQ collects messages that fail processing N times. Lets you inspect and reprocess separately.',
    tags: ['sqs','dlq'], difficulty: 'medium', time: 45 }),

  q({ id: 'saa-q-010', certId: C, examCode: E, domainId: 'saa-perf', objectiveId: 'saa-obj-storage',
    q: 'A high-performance computing workload requires sub-millisecond latency on a shared filesystem at hundreds of GB/s throughput. Which service is appropriate?',
    a: [['a','EFS'],['b','FSx for Windows'],['c','FSx for Lustre', true],['d','EBS gp3']],
    why: 'FSx for Lustre is purpose-built for HPC workloads with sub-ms latency and very high throughput.',
    tags: ['fsx','hpc','lustre'], difficulty: 'hard', time: 60 }),

  q({ id: 'saa-q-011', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'A company wants to encrypt S3 objects at rest using keys that AWS manages but the customer can audit usage of via CloudTrail. Which encryption option is BEST?',
    a: [
      ['a','SSE-S3'],
      ['b','SSE-KMS', true],
      ['c','SSE-C'],
      ['d','Client-side encryption only']
    ],
    why: 'SSE-KMS uses KMS keys, and KMS API calls (encrypt/decrypt) appear in CloudTrail for auditing.',
    wrong: { a: 'SSE-S3 uses S3-managed keys and is not directly auditable per object.', c: 'SSE-C requires customer to provide keys with each request.', d: 'Client-side does not use AWS-managed keys at all.' },
    tags: ['s3','kms','encryption'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-012', certId: C, examCode: E, domainId: 'saa-resilient', objectiveId: 'saa-obj-ha',
    q: 'Which TWO are typical reasons to choose an Application Load Balancer over a Network Load Balancer? (Choose two.)',
    type: 'multiple_select',
    a: [
      ['a','Path-based routing', true],
      ['b','Host-based routing', true],
      ['c','Static IP per AZ'],
      ['d','UDP support'],
      ['e','TCP-only at extreme scale']
    ],
    why: 'ALB is Layer 7 and supports path/host routing. NLB is Layer 4 with static IPs and UDP support.',
    tags: ['alb','nlb','routing'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-013', certId: C, examCode: E, domainId: 'saa-cost', objectiveId: 'saa-obj-ha',
    q: 'A web fleet on EC2 has predictable baseline traffic of 10 instances and unpredictable spikes up to 50 instances. What is the most cost-effective strategy?',
    a: [
      ['a','50 On-Demand instances always running'],
      ['b','50 Reserved Instances'],
      ['c','10 Reserved Instances + Auto Scaling On-Demand for the rest', true],
      ['d','50 Spot Instances']
    ],
    why: 'RI/Savings Plan covers the predictable baseline cheaply. Auto Scaling On-Demand handles the variable layer. Spot is risky for a customer-facing web tier without architecture work.',
    tags: ['cost-optimization','ri','auto-scaling'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-014', certId: C, examCode: E, domainId: 'saa-resilient', objectiveId: 'saa-obj-decoupling',
    q: 'A serverless application receives webhook events that must be processed asynchronously and durably. Which architecture is BEST?',
    a: [
      ['a','API Gateway → Lambda directly'],
      ['b','API Gateway → SQS → Lambda', true],
      ['c','API Gateway → DynamoDB Streams → Lambda'],
      ['d','API Gateway → S3 → Lambda']
    ],
    why: 'SQS in the middle decouples the webhook from processing. Lambda failures do not lose events; SQS retries.',
    tags: ['serverless','sqs','webhooks'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-015', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'What is the MOST secure way to allow a Lambda function to access an S3 bucket?',
    a: [
      ['a','Embed access keys in environment variables'],
      ['b','Use the Lambda execution role with a least-privilege S3 policy', true],
      ['c','Use the root account credentials'],
      ['d','Make the bucket public']
    ],
    why: 'Lambda execution roles provide temporary credentials scoped via least-privilege policies. No keys to leak.',
    tags: ['lambda','iam','execution-role'], difficulty: 'easy', time: 30 }),

  // ── Design Secure Architectures (saa-q-016 through saa-q-030) ──────────────

  q({ id: 'saa-q-016', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'A central security team allows developers to create IAM roles, but every role the developers create must never exceed specific permissions that the security team pre-defines. Which IAM feature enforces this boundary?',
    a: [
      ['a','Service Control Policy (SCP)'],
      ['b','IAM Permissions Boundary', true],
      ['c','Resource-based policy'],
      ['d','IAM policy condition keys'],
    ],
    why: 'A permissions boundary is an IAM managed policy set on a user or role that defines the maximum permissions it can ever hold — even if an admin grants broader rights, the boundary caps what is actually effective.',
    wrong: { a: 'SCPs apply org-wide at the account level, not to individual IAM entities within an account.', c: 'Resource-based policies grant access to resources, they do not cap what a role can be granted.' },
    trap: 'SCPs and permissions boundaries are both "guardrails," but SCPs operate at the AWS Organizations level and permissions boundaries operate at the IAM entity level within an account.',
    tags: ['iam','permissions-boundary'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-017', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'A company using AWS Organizations wants to prevent ALL accounts in a specific OU from ever creating public S3 buckets, regardless of individual IAM policies in those accounts. What is the CORRECT mechanism?',
    a: [
      ['a','Attach an IAM permissions boundary to every IAM user in each account'],
      ['b','Apply a Service Control Policy (SCP) to the OU that denies s3:PutBucketPublicAccessBlock with a condition', true],
      ['c','Enable S3 Block Public Access in each account individually'],
      ['d','Use AWS Config to auto-remediate public buckets after creation'],
    ],
    why: 'SCPs applied to an OU are guardrails that affect all accounts in that OU and cannot be overridden by any IAM policy inside those accounts — making them the correct preventive control.',
    wrong: { c: 'Account-level Block Public Access is correct but must be applied manually per account; SCP enforces it org-wide automatically.', d: 'Config with auto-remediation is detective + corrective, not preventive — the bucket becomes public momentarily.' },
    trap: 'An SCP does not grant permissions; it only restricts what IAM policies in member accounts can grant.',
    tags: ['organizations','scp'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-018', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'A security engineer needs to block SSH access (port 22) at the subnet level so that even misconfigured security groups cannot allow SSH in. Which control is applied at the subnet level and is STATELESS?',
    a: [
      ['a','Security Group with deny rule'],
      ['b','Network ACL (NACL) with an explicit deny for port 22', true],
      ['c','IAM policy denying ec2:AuthorizeSecurityGroupIngress'],
      ['d','VPC Flow Logs'],
    ],
    why: 'NACLs are subnet-level, stateless firewalls that support explicit deny rules. Security groups are stateful and attached to instances/ENIs, not subnets. NACLs evaluate both inbound and outbound separately.',
    wrong: { a: 'Security groups are stateful — they track connection state — and do not support explicit deny rules; only allow rules.' },
    trap: 'Security groups are stateful (return traffic automatically allowed). NACLs are stateless — you must allow both inbound and outbound rules explicitly for bidirectional traffic.',
    tags: ['nacl','security-groups','vpc'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-019', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'An application in a private subnet needs to call the S3 API. The team does not want S3 traffic leaving the VPC over the public internet. Which solution keeps traffic within the AWS network at no additional data-transfer charge?',
    a: [
      ['a','VPC Interface Endpoint for S3'],
      ['b','VPC Gateway Endpoint for S3', true],
      ['c','NAT Gateway with an S3 bucket policy'],
      ['d','AWS PrivateLink for S3'],
    ],
    why: 'S3 and DynamoDB support Gateway Endpoints which are free, placed in the route table, and route traffic through the AWS backbone without NAT Gateway charges.',
    wrong: { a: 'Interface Endpoints (PrivateLink) for S3 exist but cost hourly + data-processing fees. Gateway Endpoints are free for S3 and DynamoDB.' },
    trap: 'S3 has BOTH a Gateway Endpoint (free, route-table-based) and an Interface Endpoint (paid, DNS-based). The exam tests whether you pick the cost-efficient option.',
    tags: ['vpc-endpoint','s3','privatelink'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-020', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'A SaaS provider wants to expose their internal service to specific customer VPCs without those customers having routing access to the rest of the provider VPC. Which AWS feature is designed for this?',
    a: [
      ['a','VPC Peering'],
      ['b','Transit Gateway'],
      ['c','AWS PrivateLink', true],
      ['d','VPN Site-to-Site'],
    ],
    why: 'AWS PrivateLink (VPC Interface Endpoints backed by a Network Load Balancer) exposes a specific service endpoint to other VPCs privately without VPC peering or exposing the full network.',
    wrong: { a: 'VPC Peering exposes full CIDR ranges to each other.', b: 'Transit Gateway connects multiple VPCs but does not limit exposure to a single service endpoint.' },
    tags: ['privatelink','vpc-endpoint'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-021', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'A company has an S3 bucket holding billing data. They want to ensure that ONLY the finance IAM role can read objects, regardless of whether any other policy accidentally grants access. Where should they place this restriction?',
    a: [
      ['a','S3 Object ACL on every object'],
      ['b','S3 Bucket Policy with a Deny for all principals except the finance role', true],
      ['c','Block Public Access setting'],
      ['d','S3 Access Control List on the bucket'],
    ],
    why: 'A bucket policy with an explicit Deny for all principals EXCEPT the finance role is the scalable approach. Explicit deny overrides any allow in any policy, ensuring no other entity can read the data.',
    wrong: { a: 'Object ACLs would need to be set on every object individually and are not recommended over bucket policies.', c: 'Block Public Access prevents public ACLs but does not restrict authenticated IAM principals.' },
    tags: ['s3','bucket-policy','acl'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-022', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'A developer wants to encrypt an application secret using AWS KMS. They call GenerateDataKey, which returns a plaintext data key and an encrypted data key. The developer encrypts the data with the plaintext key, then discards it. What does the developer store alongside the ciphertext?',
    a: [
      ['a','The KMS CMK ARN only'],
      ['b','The plaintext data key'],
      ['c','The encrypted data key alongside the ciphertext', true],
      ['d','Nothing — KMS stores the key automatically'],
    ],
    why: 'This is KMS envelope encryption: the plaintext key encrypts the data and is immediately discarded. The encrypted data key is stored next to the ciphertext. Decryption requires calling KMS Decrypt to recover the plaintext key.',
    wrong: { b: 'Storing the plaintext key defeats the purpose of envelope encryption.' },
    trap: 'KMS does not store the data encryption key — only the CMK that can decrypt the envelope key. You must store the encrypted data key yourself.',
    tags: ['kms','envelope-encryption'], difficulty: 'hard', time: 90 }),

  q({ id: 'saa-q-023', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'An application needs to retrieve a database password that must be automatically rotated every 30 days without a code change, and the rotation should integrate with RDS directly. Which service is BEST?',
    a: [
      ['a','AWS SSM Parameter Store SecureString'],
      ['b','AWS Secrets Manager', true],
      ['c','KMS with manual rotation lambda'],
      ['d','Hardcode and deploy a new Lambda for each rotation'],
    ],
    why: 'Secrets Manager provides built-in automatic rotation that integrates directly with RDS, Redshift, and DocumentDB. SSM Parameter Store SecureString does not have built-in automatic rotation.',
    wrong: { a: 'Parameter Store SecureString is cheaper but does not have native automatic rotation integrations with RDS.' },
    trap: 'Secrets Manager costs more than Parameter Store but is the right answer when automatic rotation with RDS integration is required.',
    tags: ['secrets-manager','ssm','rotation'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-024', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'A compliance team needs to audit every time any IAM user calls s3:GetObject on a specific S3 bucket. S3 management events alone are not enough. Which CloudTrail setting must they enable?',
    a: [
      ['a','CloudTrail Insights'],
      ['b','CloudTrail data events for the S3 bucket', true],
      ['c','S3 server access logging'],
      ['d','CloudTrail management events'],
    ],
    why: 'CloudTrail data events capture object-level API activity (e.g., GetObject, PutObject) on S3. Management events only capture bucket-level operations. Data events must be explicitly enabled as they are off by default.',
    wrong: { d: 'Management events cover S3 bucket creation/deletion and IAM/console actions — not individual object reads.' },
    tags: ['cloudtrail','data-events','s3'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-025', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'A security team wants to automatically remediate EC2 instances that are non-compliant with a "require IMDSv2" rule. Which service combination detects drift and triggers automated remediation?',
    a: [
      ['a','GuardDuty + Lambda'],
      ['b','AWS Config rule + Systems Manager Automation document', true],
      ['c','Trusted Advisor + EventBridge'],
      ['d','Security Hub + Inspector'],
    ],
    why: 'AWS Config evaluates resources against rules continuously. Config can trigger SSM Automation documents (runbooks) for auto-remediation when drift is detected.',
    wrong: { a: 'GuardDuty detects threats and anomalies, not configuration drift against rules.' },
    tags: ['aws-config','ssm','compliance'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-026', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'GuardDuty identifies that an EC2 instance is communicating with a known cryptocurrency mining domain. The team wants to automatically isolate the instance within minutes. Which is the BEST architecture?',
    a: [
      ['a','GuardDuty → SNS email → on-call engineer manually isolates'],
      ['b','GuardDuty → EventBridge rule → Lambda that removes the instance from its security group and adds an isolation SG', true],
      ['c','GuardDuty → CloudTrail → Config remediation'],
      ['d','GuardDuty → Inspector finding → SSM'],
    ],
    why: 'GuardDuty findings appear as EventBridge events. An EventBridge rule can trigger Lambda in near real-time. Lambda can call EC2 APIs to swap security groups, effectively isolating the instance without human intervention.',
    tags: ['guardduty','eventbridge','lambda','automation'], difficulty: 'hard', time: 90 }),

  q({ id: 'saa-q-027', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'A company uses ACM to provision TLS certificates for an ALB. The certificate is about to expire. What does ACM do automatically for a certificate it originally issued?',
    a: [
      ['a','Nothing — you must manually renew and reimport'],
      ['b','ACM automatically renews and replaces the certificate if the domain validation method is still valid', true],
      ['c','ACM sends an SNS notification but requires manual renewal'],
      ['d','ACM renews only for wildcard certificates'],
    ],
    why: 'ACM-issued certificates associated with AWS services (ALB, CloudFront) are automatically renewed and deployed by ACM before expiry, as long as the DNS or email validation records are still in place.',
    tags: ['acm','certificates','tls'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-028', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'An application receives HTTP requests from the internet. A web application firewall must inspect Layer 7 payloads for SQL injection and XSS. DDoS at the network layer is covered separately. Which services match each requirement respectively?',
    a: [
      ['a','AWS Shield Standard (Layer 7) and WAF (Layer 3/4)'],
      ['b','AWS WAF (Layer 7 SQL/XSS) and AWS Shield (Layer 3/4 DDoS)', true],
      ['c','AWS Network Firewall for both'],
      ['d','Security Groups for Layer 7, WAF for Layer 3'],
    ],
    why: 'WAF inspects HTTP/HTTPS traffic at Layer 7 for application-level attacks. Shield protects against volumetric DDoS at Layer 3/4. They are complementary and not interchangeable.',
    wrong: { c: 'Network Firewall inspects at Layer 3-7 for east-west/north-south VPC traffic, not the managed WAF rules for web app attacks on ALB/CloudFront.' },
    tags: ['waf','shield','network-firewall'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-029', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'Account A owns an S3 bucket. Account B needs read access to objects in that bucket. Which TWO methods can grant cross-account access WITHOUT requiring Account B users to assume a role in Account A? (Choose two.)',
    type: 'multiple_select',
    a: [
      ['a','S3 bucket policy granting s3:GetObject to Account B\'s IAM role principal', true],
      ['b','S3 bucket policy granting s3:GetObject to Account B\'s root ARN (aws:PrincipalOrgID condition)', true],
      ['c','IAM policy in Account B alone (no bucket policy)'],
      ['d','VPC Gateway Endpoint policy'],
      ['e','Attaching an IAM role from Account A to Account B users'],
    ],
    why: 'Cross-account S3 access can be granted via a bucket policy that explicitly trusts an Account B principal. With S3, cross-account access typically requires BOTH an identity policy in Account B AND a bucket policy in Account A — but the bucket policy alone (using the account root ARN or role ARN) is the account A side of the solution.',
    wrong: { c: 'An IAM policy in Account B alone is insufficient — S3 resource-based policy must also allow the cross-account principal.' },
    tags: ['s3','cross-account','bucket-policy'], difficulty: 'exam_level', time: 90 }),

  q({ id: 'saa-q-030', certId: C, examCode: E, domainId: 'saa-secure', objectiveId: 'saa-obj-iam-advanced',
    q: 'An S3 bucket has Block Public Access enabled at the account level. A developer tries to add a bucket ACL that makes the bucket public. What happens?',
    a: [
      ['a','The ACL is applied because bucket ACLs override account settings'],
      ['b','The request is blocked and returns an error', true],
      ['c','The ACL is applied but objects remain private'],
      ['d','The bucket becomes public only for new objects'],
    ],
    why: 'S3 Block Public Access at the account level is a hard block — it prevents any bucket policy or ACL from making buckets or objects public, regardless of what the individual bucket settings say.',
    tags: ['s3','block-public-access'], difficulty: 'medium', time: 45 }),

  // ── Design Resilient Architectures (saa-q-031 through saa-q-041) ──────────

  q({ id: 'saa-q-031', certId: C, examCode: E, domainId: 'saa-resilient', objectiveId: 'saa-obj-ha',
    q: 'A global e-commerce platform needs its database to survive a full Region failure with an RPO of under 1 second and an RTO of under 1 minute. Which database option meets these requirements?',
    a: [
      ['a','RDS Multi-AZ'],
      ['b','Aurora Multi-AZ cluster'],
      ['c','Aurora Global Database', true],
      ['d','DynamoDB with on-demand backups'],
    ],
    why: 'Aurora Global Database replicates with typically under 1 second RPO across Regions and can be promoted in under 1 minute RTO. RDS and Aurora Multi-AZ protect only against AZ failures within one Region.',
    wrong: { b: 'Aurora Multi-AZ fails over within a Region; it does not survive a full Region outage.' },
    tags: ['aurora','global-database','rpo-rto'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-032', certId: C, examCode: E, domainId: 'saa-resilient', objectiveId: 'saa-obj-ha',
    q: 'A gaming company needs a globally distributed leaderboard where players in any Region can write scores simultaneously with sub-millisecond reads. Which service provides active-active multi-Region writes?',
    a: [
      ['a','Aurora Global Database'],
      ['b','DynamoDB Global Tables', true],
      ['c','ElastiCache Redis with cross-region replication'],
      ['d','RDS Read Replicas in each Region'],
    ],
    why: 'DynamoDB Global Tables provides active-active multi-Region replication where any Region accepts writes and changes propagate to all other Regions within seconds.',
    wrong: { a: 'Aurora Global Database has one primary Region for writes; secondary Regions are read-only unless promoted.' },
    tags: ['dynamodb','global-tables','multi-region'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-033', certId: C, examCode: E, domainId: 'saa-resilient', objectiveId: 'saa-obj-ha',
    q: 'An ElastiCache Redis cluster must handle 500 GB of data with high availability. The cluster must survive a primary node failure with minimal downtime. Which configuration is appropriate?',
    a: [
      ['a','Single-node Redis cluster'],
      ['b','Redis cluster mode disabled with Multi-AZ replication group', true],
      ['c','Redis cluster mode enabled for horizontal sharding only'],
      ['d','Memcached cluster with partitioned data'],
    ],
    why: 'Redis with cluster mode disabled supports one shard with replication (primary + replicas across AZs). Multi-AZ enables automatic failover when the primary fails. Cluster mode enabled is for data sharding across multiple shards — more appropriate when data exceeds a single shard capacity.',
    wrong: { d: 'Memcached does not support replication or automatic failover.' },
    tags: ['elasticache','redis','cluster-mode'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-034', certId: C, examCode: E, domainId: 'saa-resilient', objectiveId: 'saa-obj-decoupling',
    q: 'An order processing system has steps: validate payment → reserve inventory → notify warehouse. If any step fails, earlier completed steps must be rolled back. Which service manages this stateful orchestration reliably?',
    a: [
      ['a','SQS with multiple queues'],
      ['b','SNS with Lambda subscribers'],
      ['c','AWS Step Functions', true],
      ['d','EventBridge with multiple rules'],
    ],
    why: 'Step Functions is designed for stateful workflow orchestration with built-in error handling, retries, and compensating transactions (sagas). It tracks each step\'s state and can handle rollback flows.',
    wrong: { a: 'SQS with multiple queues cannot natively track state across steps or trigger compensating transactions.' },
    tags: ['step-functions','orchestration'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-035', certId: C, examCode: E, domainId: 'saa-resilient', objectiveId: 'saa-obj-decoupling',
    q: 'A financial system sends trade messages that must be processed in exact order and each message must be processed exactly once. Which SQS queue type is appropriate?',
    a: [
      ['a','SQS Standard Queue'],
      ['b','SQS FIFO Queue', true],
      ['c','SQS Standard Queue with a deduplication table in DynamoDB'],
      ['d','SNS FIFO Topic'],
    ],
    why: 'SQS FIFO queues guarantee ordering and exactly-once delivery. Standard queues provide best-effort ordering and at-least-once delivery (may duplicate). FIFO throughput is limited to 3,000 messages/sec with batching.',
    wrong: { a: 'Standard queues use at-least-once delivery with no ordering guarantee — unsuitable for financial trade sequences.' },
    trap: 'SQS FIFO queues support 3,000 TPS with batching or 300 TPS without — the exam may test this throughput limit.',
    tags: ['sqs','fifo'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-036', certId: C, examCode: E, domainId: 'saa-resilient', objectiveId: 'saa-obj-decoupling',
    q: 'An SNS topic receives messages from many publishers. Different subscriber services need to receive only messages relevant to their domain (e.g., orders only receive order events, not shipping events). Which SNS feature enables this?',
    a: [
      ['a','SNS FIFO topic with consumer groups'],
      ['b','SNS message filtering using subscription filter policies', true],
      ['c','Multiple SNS topics — one per event type'],
      ['d','SQS DLQ on each subscriber'],
    ],
    why: 'SNS subscription filter policies allow each subscriber to declare which message attributes it wants to receive. Messages not matching the filter are not delivered, reducing unnecessary processing.',
    tags: ['sns','message-filtering'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-037', certId: C, examCode: E, domainId: 'saa-resilient', objectiveId: 'saa-obj-decoupling',
    q: 'A streaming analytics platform ingests 50,000 IoT sensor events per second. Multiple consumer applications must independently process the same stream at different speeds, and data must be replayed up to 7 days. Which service is BEST?',
    a: [
      ['a','SQS Standard Queue'],
      ['b','SNS with Lambda'],
      ['c','Amazon Kinesis Data Streams', true],
      ['d','EventBridge with a partner event bus'],
    ],
    why: 'Kinesis Data Streams supports multiple independent consumers (each maintaining their own sequence position), configurable data retention up to 365 days, and ordered data within a shard — ideal for high-throughput streaming with replay.',
    wrong: { a: 'SQS deletes messages after consumption — replay is not possible, and only one consumer receives each message.' },
    tags: ['kinesis','streaming'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-038', certId: C, examCode: E, domainId: 'saa-resilient', objectiveId: 'saa-obj-ha',
    q: 'A microservice architecture requires containers that need to scale from 0 to thousands of tasks within minutes without managing underlying EC2 fleets. Which ECS launch type is appropriate?',
    a: [
      ['a','ECS on EC2 with an Auto Scaling Group'],
      ['b','ECS on Fargate', true],
      ['c','ECS on EC2 Spot with manual fleet management'],
      ['d','ECS Anywhere on on-premises servers'],
    ],
    why: 'ECS on Fargate is serverless — AWS provisions and manages the underlying compute. Tasks scale independently without managing EC2 capacity. Ideal for variable workloads without fleet management overhead.',
    wrong: { a: 'ECS on EC2 requires managing the ASG capacity, patching, and instance types — more operational overhead.' },
    tags: ['ecs','fargate','containers'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-039', certId: C, examCode: E, domainId: 'saa-resilient', objectiveId: 'saa-obj-ha',
    q: 'A company stores critical data in S3 in us-east-1. Regulatory requirements demand that a copy exist in eu-west-1 with the same storage class and encryption settings. Which feature automates this?',
    a: [
      ['a','S3 Versioning only'],
      ['b','S3 Cross-Region Replication (CRR)', true],
      ['c','AWS DataSync scheduled job'],
      ['d','S3 Batch Operations copy'],
    ],
    why: 'S3 CRR continuously replicates new objects to a destination bucket in a different Region. It requires versioning to be enabled on both source and destination buckets.',
    wrong: { c: 'DataSync is for bulk migrations or scheduled transfer jobs, not continuous replication of new S3 objects.' },
    trap: 'CRR replicates NEW objects after it is enabled. Existing objects must be replicated separately using S3 Batch Replication.',
    tags: ['s3','crr','replication'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-040', certId: C, examCode: E, domainId: 'saa-resilient', objectiveId: 'saa-obj-ha',
    q: 'A team is deploying updates to an Elastic Beanstalk web tier. They need zero downtime and the ability to immediately roll back if the new version has errors, but they accept higher cost during deployment. Which deployment strategy is BEST?',
    a: [
      ['a','All at once'],
      ['b','Rolling'],
      ['c','Rolling with additional batch'],
      ['d','Immutable', true],
    ],
    why: 'Immutable deployments launch a completely new Auto Scaling Group with new instances running the new version. If unhealthy, the entire new ASG is terminated and the old ASG handles all traffic. Zero downtime and instant rollback — at the cost of double capacity temporarily.',
    wrong: { a: 'All at once causes downtime during deployment.', b: 'Rolling reduces capacity during deployment and rollback requires a new deployment.' },
    tags: ['elastic-beanstalk','deployment'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-041', certId: C, examCode: E, domainId: 'saa-resilient', objectiveId: 'saa-obj-ha',
    q: 'A serverless API built on API Gateway and Lambda must remain available if Lambda has a cold start surge. Which feature provides built-in concurrency to eliminate cold starts for the critical path?',
    a: [
      ['a','Lambda reserved concurrency'],
      ['b','Lambda provisioned concurrency', true],
      ['c','API Gateway caching'],
      ['d','Lambda layers'],
    ],
    why: 'Provisioned concurrency pre-warms Lambda execution environments, ensuring they are initialized and ready to respond with no cold start latency. Reserved concurrency limits maximum scale but does not eliminate cold starts.',
    wrong: { a: 'Reserved concurrency reserves capacity quota but does not pre-warm environments — cold starts still occur.' },
    tags: ['lambda','concurrency','serverless'], difficulty: 'hard', time: 75 }),

  // ── Design High-Performing Architectures (saa-q-042 through saa-q-054) ────

  q({ id: 'saa-q-042', certId: C, examCode: E, domainId: 'saa-perf', objectiveId: 'saa-obj-storage',
    q: 'A video streaming service wants to serve HLS content globally to viewers with the lowest possible latency. Authenticated users receive signed URLs that expire after 2 hours. Which CloudFront feature issues these signed URLs?',
    a: [
      ['a','CloudFront field-level encryption'],
      ['b','CloudFront Origin Access Control (OAC)'],
      ['c','CloudFront signed URLs with a trusted key group', true],
      ['d','CloudFront Lambda@Edge'],
    ],
    why: 'CloudFront signed URLs are pre-signed with an expiration time and restrict access to a specific object or prefix. A trusted key group (EC2 key pair) signs the URL. Use signed cookies when you need to restrict access to multiple files with one token.',
    wrong: { d: 'Lambda@Edge processes requests at edge locations but is not the mechanism that creates time-limited signed URLs.' },
    trap: 'Signed URLs are per-file. Signed Cookies grant access to many files at once. The exam tests which to use based on the number of objects to protect.',
    tags: ['cloudfront','signed-urls'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-043', certId: C, examCode: E, domainId: 'saa-perf', objectiveId: 'saa-obj-storage',
    q: 'An application needs a caching layer that supports Pub/Sub messaging, Lua scripting, and data persistence to disk. Which ElastiCache engine is appropriate?',
    a: [
      ['a','ElastiCache Memcached'],
      ['b','ElastiCache Redis', true],
      ['c','ElastiCache Serverless'],
      ['d','DynamoDB DAX'],
    ],
    why: 'ElastiCache Redis supports persistence (RDB/AOF snapshots), Pub/Sub messaging, Lua scripting, sorted sets, and other advanced data structures. Memcached is simpler — multi-threading, no persistence, no Pub/Sub.',
    wrong: { a: 'Memcached does not support persistence or Pub/Sub.' },
    trap: 'Memcached is faster at raw multi-threaded throughput and simpler. Redis is chosen when you need any of: persistence, replication, Pub/Sub, sorted sets, or Lua.',
    tags: ['elasticache','redis','memcached'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-044', certId: C, examCode: E, domainId: 'saa-perf', objectiveId: 'saa-obj-storage',
    q: 'An OLTP database on RDS MySQL is experiencing heavy read load from ad-hoc analytics queries that run for minutes and impact transactional latency. What is the SIMPLEST solution?',
    a: [
      ['a','Scale up to a larger RDS instance'],
      ['b','Migrate to DynamoDB'],
      ['c','Create an Aurora read replica and direct analytics queries to it', true],
      ['d','Move to Redshift for OLTP'],
    ],
    why: 'Aurora Read Replicas offload read traffic from the primary. Directing long-running analytics queries to a replica prevents them from impacting transactional latency on the primary.',
    wrong: { d: 'Redshift is OLAP (data warehousing), not OLTP. Moving the transactional database to Redshift would be incorrect.' },
    trap: 'For complex analytics on large datasets, Redshift is correct. For offloading read queries from an existing RDS/Aurora transactional database, a read replica is simpler.',
    tags: ['aurora','read-replicas','oltp'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-045', certId: C, examCode: E, domainId: 'saa-perf', objectiveId: 'saa-obj-storage',
    q: 'A DynamoDB table processes 1 KB writes at 5,000 per second. How many Write Capacity Units (WCUs) are required?',
    a: [
      ['a','1,000 WCUs'],
      ['b','2,500 WCUs'],
      ['c','5,000 WCUs', true],
      ['d','10,000 WCUs'],
    ],
    why: '1 WCU = 1 strongly consistent write of up to 1 KB per second. 5,000 writes/sec × 1 KB each = 5,000 WCUs. If objects were 1.5 KB, you would need 2 WCUs each.',
    trap: '1 WCU handles 1 write of UP TO 1 KB. Writes over 1 KB require rounding up. Reads are different: 1 RCU = 1 strongly consistent read of UP TO 4 KB.',
    tags: ['dynamodb','wcu','capacity'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-046', certId: C, examCode: E, domainId: 'saa-perf', objectiveId: 'saa-obj-storage',
    q: 'A DynamoDB application has hot-read spikes on a product catalog table — the same top 100 items are requested thousands of times per second. Which service adds microsecond caching specifically for DynamoDB?',
    a: [
      ['a','ElastiCache Redis in front of DynamoDB'],
      ['b','DynamoDB DAX (DynamoDB Accelerator)', true],
      ['c','CloudFront with DynamoDB origin'],
      ['d','API Gateway response caching'],
    ],
    why: 'DAX is a fully managed, DynamoDB-compatible in-memory cache. It is transparent to DynamoDB API calls (uses the same SDK) and provides microsecond read latency for cached items. No application code changes to switch from DynamoDB to DAX.',
    wrong: { a: 'ElastiCache Redis requires application code changes to cache DynamoDB results. DAX is transparent and DynamoDB-native.' },
    tags: ['dynamodb','dax','caching'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-047', certId: C, examCode: E, domainId: 'saa-perf', objectiveId: 'saa-obj-storage',
    q: 'A team in Brazil uploads large files (5–20 GB) to an S3 bucket in us-east-1. Uploads are slow over the public internet. Which feature accelerates these uploads by routing through CloudFront edge locations?',
    a: [
      ['a','S3 Multipart Upload only'],
      ['b','S3 Transfer Acceleration', true],
      ['c','CloudFront with S3 origin'],
      ['d','Direct Connect'],
    ],
    why: 'S3 Transfer Acceleration routes uploads through the nearest CloudFront edge location, then uses the optimized AWS backbone to the destination bucket — significantly faster for cross-continent uploads.',
    wrong: { c: 'CloudFront caches and serves data from S3; it does not accelerate uploads TO S3.' },
    trap: 'Transfer Acceleration is for uploads TO S3. CloudFront accelerates downloads FROM S3 (and other origins).',
    tags: ['s3','transfer-acceleration'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-048', certId: C, examCode: E, domainId: 'saa-perf', objectiveId: 'saa-obj-storage',
    q: 'An EC2 instance running a database needs 16,000 IOPS and 1,000 MB/s throughput, configurable independently of volume size. Which EBS volume type supports this?',
    a: [
      ['a','gp2'],
      ['b','gp3', true],
      ['c','st1'],
      ['d','sc1'],
    ],
    why: 'gp3 allows independent configuration of IOPS (up to 16,000) and throughput (up to 1,000 MB/s) regardless of volume size. gp2 IOPS is tied to size (3 IOPS/GB). st1 and sc1 are HDDs not suitable for this IOPS requirement.',
    wrong: { a: 'gp2 IOPS scales with storage size (3 IOPS/GB max 16,000) — not independently configurable.' },
    tags: ['ebs','gp3','iops'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-049', certId: C, examCode: E, domainId: 'saa-perf', objectiveId: 'saa-obj-storage',
    q: 'A batch machine learning training job runs on multiple EC2 instances that need the lowest possible network latency between nodes — single-digit microsecond latency with high bandwidth. Which EC2 placement group type is correct?',
    a: [
      ['a','Spread placement group'],
      ['b','Partition placement group'],
      ['c','Cluster placement group', true],
      ['d','No placement group needed'],
    ],
    why: 'Cluster placement groups pack instances close together in a single AZ, enabling enhanced networking with up to 100 Gbps bandwidth and single-digit microsecond latency. Ideal for HPC and distributed ML training.',
    wrong: { a: 'Spread placement groups maximize fault isolation by placing instances on different hardware — opposite goal to cluster.' },
    trap: 'Cluster = lowest latency but no HA (all instances in one AZ). Spread = highest HA. Partition = balanced for large distributed systems like HDFS that need HA but rack-level isolation.',
    tags: ['ec2','placement-groups','hpc'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-050', certId: C, examCode: E, domainId: 'saa-perf', objectiveId: 'saa-obj-storage',
    q: 'A global application serves users in Asia, Europe, and North America. Users report high latency to the application\'s NLB endpoint in us-east-1. The solution must NOT cache content and must support non-HTTP protocols. Which service is appropriate?',
    a: [
      ['a','CloudFront'],
      ['b','Route 53 geolocation routing'],
      ['c','AWS Global Accelerator', true],
      ['d','S3 Transfer Acceleration'],
    ],
    why: 'Global Accelerator uses the AWS global network (anycast) to route traffic from the nearest AWS edge to the application\'s endpoint. It works for any TCP/UDP protocol and does not cache — it accelerates routing. CloudFront caches HTTP/HTTPS content.',
    wrong: { a: 'CloudFront is a CDN that caches HTTP/HTTPS content. It is not appropriate for non-HTTP protocols or non-cacheable dynamic content at Layer 4.' },
    trap: 'Global Accelerator = routing acceleration for any protocol, no caching. CloudFront = HTTP/HTTPS CDN with caching. Both use edge locations but serve different purposes.',
    tags: ['global-accelerator','cloudfront','performance'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-051', certId: C, examCode: E, domainId: 'saa-perf', objectiveId: 'saa-obj-storage',
    q: 'A high-performance database requires the lowest possible latency storage with the highest sequential read throughput. The data is temporary and can be lost if the instance stops. Which storage option is appropriate?',
    a: [
      ['a','EBS io2'],
      ['b','EBS gp3'],
      ['c','EC2 Instance Store', true],
      ['d','EFS with Provisioned Throughput'],
    ],
    why: 'Instance store is physically attached to the host and provides the lowest latency and highest sequential throughput of any EC2 storage — at the cost of being ephemeral (data lost on stop/termination).',
    wrong: { a: 'EBS io2 is high-performance persistent block storage, but introduces network latency not present with instance store.' },
    trap: 'Instance store is faster than EBS but ephemeral. Use it for scratch space, buffer caches, or temp data where persistence is not required.',
    tags: ['instance-store','ebs','storage-performance'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-052', certId: C, examCode: E, domainId: 'saa-perf', objectiveId: 'saa-obj-storage',
    q: 'An EFS file system starts throttling because a recently mounted EC2 burst reads more than the baseline throughput. The workload is steady but consistently high. Which EFS mode removes the burst credit limit?',
    a: [
      ['a','EFS General Purpose performance mode'],
      ['b','EFS Bursting Throughput mode'],
      ['c','EFS Provisioned Throughput mode', true],
      ['d','EFS One Zone storage class'],
    ],
    why: 'EFS Provisioned Throughput mode allows you to specify a fixed throughput level independent of storage size. Bursting Throughput depends on burst credits that accumulate based on stored data amount.',
    wrong: { b: 'Bursting mode is the default and subject to credit limits — exactly the problem described.' },
    tags: ['efs','throughput'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-053', certId: C, examCode: E, domainId: 'saa-perf', objectiveId: 'saa-obj-storage',
    q: 'A Lambda function processes images synchronously and is being invoked by thousands of concurrent API Gateway requests. After a spike, new invocations start failing with throttling errors. What configuration change prevents this while guaranteeing the function always has at least 200 concurrent executions available?',
    a: [
      ['a','Increase Lambda timeout to 15 minutes'],
      ['b','Enable Lambda provisioned concurrency'],
      ['c','Set Lambda reserved concurrency to 200', true],
      ['d','Configure Lambda to use ARM architecture for speed'],
    ],
    why: 'Reserved concurrency guarantees that at least 200 concurrent executions are always available for this function by reserving quota from the account limit. It also caps this function at 200 to prevent it from consuming the whole account quota.',
    wrong: { b: 'Provisioned concurrency pre-warms environments to reduce cold starts, but does not reserve capacity quota from the account limit.' },
    trap: 'Reserved concurrency sets a MAXIMUM for the function and GUARANTEES that capacity is available. Provisioned concurrency pre-warms instances. They solve different problems.',
    tags: ['lambda','reserved-concurrency'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-054', certId: C, examCode: E, domainId: 'saa-perf', objectiveId: 'saa-obj-storage',
    q: 'A data warehouse workload runs complex aggregations over petabytes of historical sales data. Queries join many large tables with no transactional updates. Which AWS database is MOST appropriate?',
    a: [
      ['a','RDS Aurora for MySQL'],
      ['b','DynamoDB with GSIs'],
      ['c','Amazon Redshift', true],
      ['d','ElastiCache Redis'],
    ],
    why: 'Redshift is a columnar OLAP database optimized for analytical queries over large datasets. RDS/Aurora is OLTP (row-based, transactional). DynamoDB is a key-value/document NoSQL store.',
    wrong: { a: 'Aurora is OLTP — row-based, optimized for transactions, not for petabyte analytical aggregations.' },
    trap: 'OLAP (Redshift) vs OLTP (Aurora/RDS). Columnar storage is the key differentiator — Redshift reads only queried columns, making aggregations fast.',
    tags: ['redshift','olap'], difficulty: 'medium', time: 60 }),

  // ── Design Cost-Optimized Architectures (saa-q-055 through saa-q-065) ─────

  q({ id: 'saa-q-055', certId: C, examCode: E, domainId: 'saa-cost', objectiveId: 'saa-obj-storage',
    q: 'A company stores application logs in S3. Logs are accessed frequently in the first 30 days, occasionally from 30–90 days, and almost never after 90 days. After 1 year, they can be deleted. Which S3 Lifecycle configuration is MOST cost-effective?',
    a: [
      ['a','Keep all objects in Standard for 1 year, then delete'],
      ['b','Transition to Standard-IA at 30 days, to Glacier Flexible Retrieval at 90 days, delete at 365 days', true],
      ['c','Transition to Intelligent-Tiering immediately'],
      ['d','Transition to Glacier Instant Retrieval at 30 days'],
    ],
    why: 'Matching access patterns to lifecycle rules minimizes cost: Standard for hot data, Standard-IA for infrequent, Glacier for archive. Intelligent-Tiering is more appropriate when access patterns are unknown.',
    wrong: { c: 'Intelligent-Tiering is appropriate when access patterns are unpredictable. When patterns are known, explicit lifecycle rules are cheaper.' },
    tags: ['s3','lifecycle','glacier'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-056', certId: C, examCode: E, domainId: 'saa-cost', objectiveId: 'saa-obj-ha',
    q: 'A company commits to running 20 EC2 instances for 1 year and wants maximum flexibility to change instance families, sizes, and operating systems without losing the discount. Which pricing option is BEST?',
    a: [
      ['a','Standard Reserved Instances'],
      ['b','Convertible Reserved Instances'],
      ['c','Compute Savings Plans', true],
      ['d','EC2 Instance Savings Plans'],
    ],
    why: 'Compute Savings Plans offer the broadest flexibility: any EC2 instance family, size, OS, tenancy, and Region — plus Lambda and Fargate — in exchange for a $/hour spend commitment. Convertible RIs allow family changes but are tied to EC2 only.',
    wrong: { a: 'Standard RIs are locked to a specific instance family and size; changing requires selling/buying on the marketplace.' },
    trap: 'Savings Plans vs RIs: Savings Plans commit to dollar spend per hour and are more flexible. Standard RIs commit to a specific instance type and give a slightly higher discount. EC2 Instance Savings Plans are like compute savings plans but locked to one Region.',
    tags: ['savings-plans','reserved-instances','cost-optimization'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-057', certId: C, examCode: E, domainId: 'saa-cost', objectiveId: 'saa-obj-ha',
    q: 'A batch data processing fleet runs 8-hour jobs on weekday nights. Jobs can be interrupted and restarted from a checkpoint. Which EC2 pricing model provides the DEEPEST discount for this workload?',
    a: [
      ['a','On-Demand Instances'],
      ['b','Reserved Instances 1-year term'],
      ['c','EC2 Spot Instances', true],
      ['d','Dedicated Hosts'],
    ],
    why: 'Spot Instances offer up to 90% off On-Demand prices. Since the job can checkpoint and restart on interruption, Spot is ideal. Spot is not suitable for jobs that cannot tolerate interruption.',
    wrong: { b: 'RIs require a 1-year commitment for a nightly batch job — poor utilization of the commitment.' },
    tags: ['spot','cost-optimization'], difficulty: 'easy', time: 45 }),

  q({ id: 'saa-q-058', certId: C, examCode: E, domainId: 'saa-cost', objectiveId: 'saa-obj-ha',
    q: 'An operations team wants right-sizing recommendations for EC2 instances that are consistently underutilized. Which AWS service provides these recommendations?',
    a: [
      ['a','AWS Trusted Advisor'],
      ['b','AWS Cost Explorer'],
      ['c','AWS Compute Optimizer', true],
      ['d','AWS Config'],
    ],
    why: 'AWS Compute Optimizer analyzes CloudWatch utilization metrics and provides EC2 right-sizing recommendations (optimal instance type and size). Cost Explorer provides cost analytics and some RI recommendations but not deep instance optimization.',
    wrong: { a: 'Trusted Advisor has a cost optimization check but Compute Optimizer provides deeper, ML-driven right-sizing analysis.' },
    tags: ['compute-optimizer','right-sizing'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-059', certId: C, examCode: E, domainId: 'saa-cost', objectiveId: 'saa-obj-storage',
    q: 'S3 Intelligent-Tiering has a monitoring and automation fee per object. For which type of object would using Intelligent-Tiering INCREASE cost compared to S3 Standard?',
    a: [
      ['a','Large objects (greater than 1 GB) with unknown access patterns'],
      ['b','Small objects (less than 128 KB) with infrequent access', true],
      ['c','Objects accessed daily'],
      ['d','Objects in us-east-1'],
    ],
    why: 'Intelligent-Tiering charges a per-object monitoring fee. For very small objects (under 128 KB), this fee can exceed the storage savings from tiering, making Standard cheaper overall.',
    trap: 'The 128 KB threshold is an exam-tested detail. AWS does not charge Intelligent-Tiering monitoring fees for objects smaller than 128 KB — they remain stored in the Frequent Access tier, which means it costs the same as Standard for small objects. The cost optimization benefit of IT requires objects large enough for tier savings to exceed monitoring cost.',
    tags: ['s3','intelligent-tiering','cost'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-060', certId: C, examCode: E, domainId: 'saa-cost', objectiveId: 'saa-obj-ha',
    q: 'A VPC in us-east-1 has private EC2 instances that access the internet only for outbound software updates. The current NAT Gateway costs are high. A team proposes replacing it with a NAT Instance. What is the key trade-off?',
    a: [
      ['a','NAT Instance supports IPv6; NAT Gateway does not'],
      ['b','NAT Gateway is fully managed and scales automatically; NAT Instance requires patching and manual scaling', true],
      ['c','NAT Instance provides higher bandwidth than NAT Gateway'],
      ['d','NAT Gateway supports security groups; NAT Instance does not'],
    ],
    why: 'NAT Instances are cheaper but require manual patching, monitoring, and do not auto-scale. NAT Gateways are fully managed, highly available, and auto-scale — but cost more.',
    wrong: { d: 'It is the opposite: NAT Instances support security groups; NAT Gateways do not (use NACLs for NAT Gateway).' },
    tags: ['nat-gateway','nat-instance','cost'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-061', certId: C, examCode: E, domainId: 'saa-cost', objectiveId: 'saa-obj-storage',
    q: 'A team copies 500 GB of data from an EC2 instance in us-east-1a to an S3 bucket. Later they copy the same data to an EC2 instance in us-east-1b. Which transfers incur data transfer charges?',
    a: [
      ['a','Both transfers incur charges'],
      ['b','EC2 to S3 only'],
      ['c','EC2-to-EC2 cross-AZ transfer incurs charges; EC2 to S3 in the same Region is free', true],
      ['d','Neither incurs charges because both are in the same Region'],
    ],
    why: 'Data transfer into S3 from EC2 in the same Region is free. Data transferred between EC2 instances in different AZs (even in the same Region) costs $0.01/GB per direction when using private IPs.',
    trap: 'Same-Region S3 transfers are free in. Cross-AZ EC2-to-EC2 costs money. Using public IPs between AZs costs even more. Know the data transfer cost matrix.',
    tags: ['data-transfer','cost','s3','ec2'], difficulty: 'hard', time: 75 }),

  q({ id: 'saa-q-062', certId: C, examCode: E, domainId: 'saa-cost', objectiveId: 'saa-obj-ha',
    q: 'A startup has a variable API workload: near-zero at night, spikes to thousands of invocations during business hours. They pay per request. Which compute model is MOST cost-effective?',
    a: [
      ['a','EC2 On-Demand t3.medium always running'],
      ['b','EC2 Auto Scaling with a minimum of 2 instances'],
      ['c','AWS Lambda with pay-per-invocation', true],
      ['d','EC2 Reserved Instance 1-year term'],
    ],
    why: 'Lambda charges only for actual invocations and duration. Near-zero traffic at night means near-zero cost. EC2 charges for the instance uptime whether or not requests are being processed.',
    tags: ['lambda','cost','serverless'], difficulty: 'easy', time: 45 }),

  q({ id: 'saa-q-063', certId: C, examCode: E, domainId: 'saa-cost', objectiveId: 'saa-obj-ha',
    q: 'A SaaS application has a database workload that is idle overnight and spikes dramatically during business hours. The team wants to avoid paying for Aurora capacity that sits idle 12 hours a day. Which Aurora option is MOST cost-effective?',
    a: [
      ['a','Aurora Provisioned with minimum instances'],
      ['b','Aurora Multi-AZ with scheduled scaling'],
      ['c','Aurora Serverless v2', true],
      ['d','RDS MySQL Multi-AZ'],
    ],
    why: 'Aurora Serverless v2 scales capacity in fine-grained increments (0.5 ACU steps) in seconds, including scaling to a very low ACU during off-hours, minimizing costs for spiky or idle workloads.',
    wrong: { a: 'Provisioned Aurora has fixed capacity — idle capacity still costs money.' },
    tags: ['aurora-serverless','cost'], difficulty: 'medium', time: 60 }),

  q({ id: 'saa-q-064', certId: C, examCode: E, domainId: 'saa-cost', objectiveId: 'saa-obj-ha',
    q: 'A finance team needs to identify which departments are responsible for high EC2 and S3 costs. Which AWS feature enables cost breakdown by department?',
    a: [
      ['a','AWS Budgets'],
      ['b','AWS Trusted Advisor'],
      ['c','Cost allocation tags analyzed in AWS Cost Explorer', true],
      ['d','AWS Config cost rules'],
    ],
    why: 'Cost allocation tags applied to resources (e.g., Department=Engineering) appear in Cost Explorer, allowing granular cost attribution by department, project, or team.',
    tags: ['cost-explorer','cost-allocation-tags'], difficulty: 'easy', time: 45 }),

  q({ id: 'saa-q-065', certId: C, examCode: E, domainId: 'saa-cost', objectiveId: 'saa-obj-ha',
    q: 'A development team wants an RDS MySQL database for testing. It does not need to survive an AZ failure and needs to minimize cost. Which deployment is appropriate?',
    a: [
      ['a','Multi-AZ RDS with db.r6g.large'],
      ['b','Single-AZ RDS with db.t3.micro', true],
      ['c','Aurora Global Database'],
      ['d','RDS Proxy with Multi-AZ'],
    ],
    why: 'Dev/test databases do not require Multi-AZ or production-tier instances. Single-AZ with a smaller instance class (t3.micro) eliminates the standby replica cost and uses the smallest billable tier.',
    wrong: { a: 'Multi-AZ doubles cost by running a synchronous standby replica that has no benefit for non-critical dev/test.' },
    tags: ['rds','cost','dev-test'], difficulty: 'easy', time: 45 }),
];

export const sideQuests = [{
  id: 'saa-quest-storage', certId: CERT_ID, objectiveId: 'saa-obj-storage',
  template: 'cable_crafter' as const,
  title: 'The Architect Trial: Storage Selection',
  story: 'Five workloads land on your desk. Match each to the correct AWS storage service.',
  payload: {
    passThreshold: 80,
    items: [
      { id: 'i1', label: 'Linux NFS shared file system across many EC2 instances', answer: 'EFS', distractors: ['EBS', 'FSx for Windows', 'S3'] },
      { id: 'i2', label: 'Object storage with 11 9s durability', answer: 'S3', distractors: ['EBS', 'EFS', 'FSx'] },
      { id: 'i3', label: 'Block storage attached to one EC2 instance', answer: 'EBS', distractors: ['EFS', 'S3', 'Instance Store'] },
      { id: 'i4', label: 'Windows SMB share integrated with Active Directory', answer: 'FSx for Windows', distractors: ['EFS', 'EBS', 'S3'] },
      { id: 'i5', label: 'High-performance computing parallel file system', answer: 'FSx for Lustre', distractors: ['EFS', 'FSx for Windows', 'EBS io2'] },
    ],
  },
}];

export const bossBattles = [{
  id: 'saa-boss-architecture', certId: CERT_ID, objectiveIds: ['saa-obj-ha','saa-obj-decoupling','saa-obj-iam-advanced'],
  title: 'The Three-Tier Migration',
  storySetup: 'A startup runs a monolithic e-commerce app on a single EC2 instance with a co-located MySQL database. Black Friday is in eight weeks. They expect 20x normal traffic.',
  scenario: 'Design a migration plan: how do you split the application into resilient tiers, what AWS services do you choose for each tier, how do you handle the database, what does your decoupling layer look like, and how do you secure cross-tier communication? Justify each decision.',
  constraints: ['Eight-week timeline', '20x traffic spike expected', 'Existing PHP monolith', 'Limited engineering team'],
  rubric: {
    passThreshold: 75,
    dimensions: [
      { key: 'tier_design', weight: 0.30, description: 'Did you correctly design separate web, application, and database tiers?' },
      { key: 'ha_strategy', weight: 0.25, description: 'Does the architecture survive AZ failure?' },
      { key: 'decoupling', weight: 0.20, description: 'Did you decouple async work appropriately?' },
      { key: 'security', weight: 0.25, description: 'Did you correctly apply IAM, security groups, and encryption?' },
    ],
  },
  remediation: { tier_design: ['saa-fc-001','saa-fc-003'], ha_strategy: ['saa-fc-001','saa-fc-019'], decoupling: ['saa-fc-005','saa-fc-006'], security: ['saa-fc-013','saa-fc-014'] },
}];

export const practiceExams = [{
  id: 'saa-mini-exam', certId: CERT_ID, examCode: EXAM_CODE,
  title: 'AWS SAA Mini Practice Exam', mode: 'mini' as const,
  questionCount: 10, timeLimitSeconds: 20 * 60,
  passingScaledScore: 720, scaledScoreMax: 1000, scaledScoreMin: 100,
  domainTargets: [
    { domainId: 'saa-resilient', questionCount: 3 },
    { domainId: 'saa-perf', questionCount: 2 },
    { domainId: 'saa-secure', questionCount: 3 },
    { domainId: 'saa-cost', questionCount: 2 },
  ],
  difficultyMix: { easy: 0.1, medium: 0.5, hard: 0.35, exam_level: 0.05 },
  unlockRequirements: { minReadiness: 0, minDomainReadiness: 0, requiredBossBattlesPassed: [], minQuizAttempts: 0, requiresPriorPracticeExamPass: false },
  allowManualOverride: true,
}, {
  id: 'saa-full-exam', certId: CERT_ID, examCode: EXAM_CODE,
  title: 'AWS SAA Full Practice Exam', mode: 'full' as const,
  questionCount: 65, timeLimitSeconds: 130 * 60,
  passingScaledScore: 720, scaledScoreMax: 1000, scaledScoreMin: 100,
  domainTargets: [
    { domainId: 'saa-resilient', questionCount: 17 },
    { domainId: 'saa-perf', questionCount: 16 },
    { domainId: 'saa-secure', questionCount: 19 },
    { domainId: 'saa-cost', questionCount: 13 },
  ],
  difficultyMix: { easy: 0.05, medium: 0.40, hard: 0.45, exam_level: 0.10 },
  unlockRequirements: { minReadiness: 80, minDomainReadiness: 65, requiredBossBattlesPassed: ['saa-boss-architecture'], minQuizAttempts: 5, requiresPriorPracticeExamPass: true },
  allowManualOverride: true,
}];

export const glossary = [
  { term: 'STS', definition: 'Security Token Service — issues temporary credentials for AWS access.' },
  { term: 'KMS', definition: 'Key Management Service — managed service for cryptographic keys.' },
  { term: 'SQS', definition: 'Simple Queue Service — managed message queue.' },
  { term: 'EBS', definition: 'Elastic Block Store — block storage attached to EC2.' },
];

export const acronyms = [
  { acronym: 'ALB', expansion: 'Application Load Balancer', meaning: 'Layer 7 HTTP/HTTPS load balancer with content-based routing.' },
  { acronym: 'NLB', expansion: 'Network Load Balancer', meaning: 'Layer 4 TCP/UDP load balancer for extreme performance.' },
  { acronym: 'DLQ', expansion: 'Dead Letter Queue', meaning: 'Holds messages that failed to be processed.' },
];

export const examTraps = [
  { trap: 'Multi-AZ vs Read Replicas', explanation: 'Multi-AZ = HA failover. Read Replicas = read scaling. They solve different problems.' },
  { trap: 'EBS vs EFS', explanation: 'EBS attaches to one EC2 instance. EFS is shared across many instances.' },
  { trap: 'IAM evaluation', explanation: 'Explicit deny always wins. Default is deny. Allow only happens with explicit allow and no explicit deny.' },
];
