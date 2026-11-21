import { describe, it, expect, vi, beforeEach } from 'vitest';
import { upload } from '../../../src/middleware/upload.middleware.js';
import express from 'express';
import request from 'supertest';

describe('Upload Middleware', () => {
  it('should have correct configuration', () => {
    expect(upload).toBeDefined();
    expect(upload.limits).toBeDefined();
    expect(upload.limits.fileSize).toBe(5 * 1024 * 1024);
  });

  describe('fileFilter', () => {
    let fileFilter;

    beforeEach(() => {
      fileFilter = upload.fileFilter;
    });

    it('should accept allowed image files', () => {
      const cb = vi.fn();
      const mimetypes = ['image/jpeg', 'image/png', 'image/webp'];
      mimetypes.forEach((mimetype) => {
        const file = { mimetype };
        fileFilter({}, file, cb);
        expect(cb).toHaveBeenCalledWith(null, true);
      });
    });

    it('should accept pdf files', () => {
      const cb = vi.fn();
      const file = { mimetype: 'application/pdf' };
      fileFilter({}, file, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should reject unsupported files', () => {
      const cb = vi.fn();
      const mimetypes = ['text/plain', 'image/svg+xml'];
      mimetypes.forEach((mimetype) => {
        const file = { mimetype };
        fileFilter({}, file, cb);
        expect(cb).toHaveBeenCalledWith(expect.any(Error), false);
      });
    });
  });

  describe('Integration Test', () => {
    it('should reject files larger than 5MB', async () => {
      const app = express();

      app.post('/upload', upload.single('file'), (req, res) => {
        res.status(200).json({ message: 'Success' });
      });

      // Error handling middleware to catch Multer errors
      app.use((err, _req, res, _next) => {
        if (err.message === 'File too large') {
          return res.status(413).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
      });

      // Create a buffer larger than 5MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'a');

      const response = await request(app)
        .post('/upload')
        .attach('file', largeBuffer, { filename: 'large_file.jpg', contentType: 'image/jpeg' });

      expect(response.status).toBe(413);
      expect(response.body.error).toBe('File too large');
    });

    it('should store file in memory as a buffer', async () => {
      const app = express();

      app.post('/upload', upload.single('file'), (req, res) => {
        // Assert req.file has buffer and no destination/filename (which exist for disk storage)
        if (req.file.buffer && !req.file.destination) {
          res.status(200).json({ message: 'Success', size: req.file.size });
        } else {
          res.status(400).json({ error: 'File not stored in memory' });
        }
      });

      const smallBuffer = Buffer.alloc(1024, 'a');

      const response = await request(app)
        .post('/upload')
        .attach('file', smallBuffer, { filename: 'test.jpg', contentType: 'image/jpeg' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success');
      expect(response.body.size).toBe(1024);
    });
  });
});
