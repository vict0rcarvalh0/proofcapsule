# ProofCapsule Backend & Database Setup

## 🗄️ Database Architecture

### **Zero-Cost Deployment Strategy**
- **Local Development**: SQLite database (file-based)
- **Production (Vercel)**: Vercel Postgres (free tier)
- **No External Database Costs**: Everything runs on Vercel

### **Database Schema**

#### Core Tables
1. **`users`** - Wallet addresses and user profiles
2. **`capsules`** - ProofCapsule NFT data and metadata
3. **`verifications`** - Content verification records
4. **`analytics`** - Platform usage statistics
5. **`user_stats`** - Per-user statistics
6. **`content_metadata`** - Additional content information

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd src/client
npm install
```

### 2. Generate Database Migration
```bash
npm run db:generate
```

### 3. Run Migration (Local Development)
```bash
npm run db:migrate
```

### 4. Start Development Server
```bash
npm run dev
```

## 📊 Database Management

### Available Scripts
```bash
# Generate migration from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio

# Push schema changes directly (development only)
npm run db:push
```

### Database Configuration
- **Local**: `proofcapsule.db` (SQLite file)
- **Production**: Vercel Postgres (automatic)

## 🔌 API Endpoints

### Capsules API

#### `GET /api/capsules`
Get all capsules with optional filters.

**Query Parameters:**
- `wallet` - Filter by wallet address
- `public` - Filter by public/private status (`true`/`false`)
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset (default: 0)

**Example:**
```bash
GET /api/capsules?wallet=0x123...&public=true&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tokenId": 1,
      "walletAddress": "0x123...",
      "contentHash": "0xabc...",
      "description": "My first capsule",
      "location": "New York",
      "isPublic": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### `POST /api/capsules`
Create a new ProofCapsule.

**Request Body:**
```json
{
  "tokenId": 1,
  "walletAddress": "0x123...",
  "contentHash": "0xabc...",
  "description": "My first capsule",
  "location": "New York",
  "ipfsHash": "Qm...",
  "isPublic": true,
  "blockNumber": 12345,
  "transactionHash": "0xdef...",
  "gasUsed": 150000
}
```

#### `GET /api/capsules/[id]`
Get a specific capsule by ID.

#### `PUT /api/capsules/[id]`
Update capsule metadata.

**Request Body:**
```json
{
  "description": "Updated description",
  "location": "Updated location",
  "isPublic": false
}
```

#### `DELETE /api/capsules/[id]`
Delete a capsule.

### Verification API

#### `POST /api/verify`
Verify content hash.

**Request Body:**
```json
{
  "contentHash": "0xabc...",
  "verifierAddress": "0x123...",
  "verificationMethod": "hash_match",
  "notes": "Content verified successfully"
}
```

#### `GET /api/verify`
Get verification history.

**Query Parameters:**
- `capsuleId` - Filter by capsule ID
- `verifier` - Filter by verifier wallet address
- `limit` - Number of results
- `offset` - Pagination offset

### Analytics API

#### `GET /api/analytics`
Get platform or user analytics.

**Query Parameters:**
- `type` - `global` (default) or `user`
- `wallet` - Required when `type=user`

**Global Analytics Response:**
```json
{
  "success": true,
  "data": {
    "totalCapsules": 150,
    "totalUsers": 25,
    "totalVerifications": 75,
    "todayCapsules": 5,
    "todayUsers": 2
  }
}
```

**User Analytics Response:**
```json
{
  "success": true,
  "data": {
    "totalCapsules": 10,
    "publicCapsules": 7,
    "privateCapsules": 3,
    "totalVerifications": 5,
    "firstCapsuleAt": "2024-01-01T00:00:00Z",
    "lastCapsuleAt": "2024-01-15T00:00:00Z"
  }
}
```

## 🔧 Database Utilities

### Content Hashing
```typescript
import { hashContent, hashFile } from '@/lib/db/utils'

// Hash string content
const hash = hashContent('Hello World')

// Hash file content
const fileHash = await hashFile(file)
```

### Database Operations
```typescript
import { 
  getUserByWallet, 
  getCapsuleByHash, 
  getUserCapsules,
  getPublicCapsules 
} from '@/lib/db/utils'

// Get user by wallet address
const user = await getUserByWallet('0x123...')

// Get capsule by content hash
const capsule = await getCapsuleByHash('0xabc...')

// Get user's capsules
const userCapsules = await getUserCapsules('0x123...', 20, 0)

// Get public capsules
const publicCapsules = await getPublicCapsules(20, 0)
```

## 🔐 Security Features

### Input Validation
- Wallet address format validation
- Content hash format validation
- SQL injection prevention via Drizzle ORM

### Access Control
- Public/private capsule visibility
- User-specific data filtering
- Rate limiting (to be implemented)

## 📈 Analytics & Monitoring

### Automatic Statistics
- Daily capsule creation counts
- User registration tracking
- Verification activity monitoring
- Platform growth metrics

### Manual Analytics Updates
```bash
# Update daily analytics (can be automated with cron)
POST /api/analytics
```

## 🚀 Deployment

### Local Development
1. Database: SQLite file (`proofcapsule.db`)
2. No external dependencies
3. Instant setup and teardown

### Vercel Production
1. **Automatic**: Vercel detects and sets up Postgres
2. **Zero Configuration**: Environment variables auto-configured
3. **Free Tier**: Generous limits for ProofCapsule usage

### Environment Variables
```bash
# Local development (optional)
DATABASE_URL=file:./proofcapsule.db

# Production (auto-configured by Vercel)
POSTGRES_URL=postgresql://...
POSTGRES_HOST=...
POSTGRES_DATABASE=...
POSTGRES_USERNAME=...
POSTGRES_PASSWORD=...
```

## 🔄 Integration with Smart Contracts

### Blockchain Sync
The backend automatically syncs with your deployed smart contracts:

- **Contract Addresses**: From `DEPLOYMENT_SUMMARY.md`
- **Network**: Sonic Testnet (Chain ID: 14601)
- **Events**: Track `ProofCapsuleCreated` events

### Frontend Integration
```typescript
// Example: Create capsule and sync to database
const createCapsule = async (contentHash: string, description: string) => {
  // 1. Create on blockchain
  const tx = await nftContract.createProofCapsule(
    contentHash,
    description,
    location,
    ipfsHash,
    isPublic
  )
  
  // 2. Wait for transaction
  const receipt = await tx.wait()
  
  // 3. Sync to database
  await fetch('/api/capsules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tokenId: receipt.events[0].args.tokenId,
      walletAddress: address,
      contentHash,
      description,
      location,
      ipfsHash,
      isPublic,
      blockNumber: receipt.blockNumber,
      transactionHash: receipt.transactionHash,
      gasUsed: receipt.gasUsed.toString()
    })
  })
}
```

## 🛠️ Development Tools

### Drizzle Studio
```bash
npm run db:studio
```
- Visual database browser
- Real-time data editing
- Query builder interface

### Database Migrations
```bash
# Generate migration after schema changes
npm run db:generate

# Apply migrations
npm run db:migrate
```

## 📝 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common Error Codes
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate content hash)
- `500` - Internal Server Error

## 🎯 Next Steps

1. **Test API Endpoints**: Use tools like Postman or curl
2. **Integrate with Frontend**: Connect React components to API
3. **Add Authentication**: Implement wallet-based auth
4. **Implement Search**: Add full-text search capabilities
5. **Add Caching**: Implement Redis for performance
6. **Monitoring**: Add logging and error tracking

## 🔗 Related Files

- **Schema**: `src/client/lib/db/schema.ts`
- **Database Config**: `src/client/lib/db/index.ts`
- **API Routes**: `src/client/app/api/`
- **Utilities**: `src/client/lib/db/utils.ts`
- **Migration Config**: `src/client/drizzle.config.ts`

---

**Your backend is ready!** 🚀

The database and API are set up to work seamlessly with your smart contracts and frontend. No external costs, full Vercel compatibility, and ready for production deployment. 