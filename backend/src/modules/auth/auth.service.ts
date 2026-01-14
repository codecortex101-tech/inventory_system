import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditLogService: AuditLogService,
  ) {}

  async login(loginDto: LoginDto) {
    try {
      // Validate input
      if (!loginDto.organizationName || !loginDto.email || !loginDto.password) {
        throw new BadRequestException('Organization name, email, and password are required');
      }

      // Normalize inputs
      const normalizedOrganizationName = loginDto.organizationName.trim();
      const normalizedEmail = loginDto.email.trim().toLowerCase();

      // Find organization by name (case-insensitive exact match)
      // First try exact match, then case-insensitive match
      let organization = await this.prisma.organization.findFirst({
        where: { 
          name: normalizedOrganizationName,
        },
      });

      // If exact match not found, try case-insensitive search
      if (!organization) {
        const allOrganizations = await this.prisma.organization.findMany();
        organization = allOrganizations.find(
          org => org.name.toLowerCase() === normalizedOrganizationName.toLowerCase()
        ) || null;
      }

      if (!organization) {
        throw new UnauthorizedException('Invalid organization name, email, or password');
      }

      // Find user by email and organizationId
      const user = await this.prisma.user.findFirst({
        where: { 
          email: normalizedEmail,
          organizationId: organization.id,
        },
        include: {
          organization: true,
        },
      });

      // Check if user exists
      if (!user) {
        throw new UnauthorizedException('Invalid organization name, email, or password');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid organization name, email, or password');
      }

      // Check if user has organization
      if (!user.organizationId) {
        throw new UnauthorizedException('User account is not properly configured');
      }

      // Generate JWT token
      const payload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role, 
        organizationId: user.organizationId 
      };

      const access_token = this.jwtService.sign(payload);

      // Create audit log for login
      await this.auditLogService.createLog({
        userId: user.id,
        organizationId: user.organizationId,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        description: `User "${user.name}" logged in`,
      }).catch(() => {}); // Don't fail login if audit log fails

      // Return success response
      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          organizationName: user.organization?.name || '',
          organization: user.organization ? {
            id: user.organization.id,
            name: user.organization.name,
          } : null,
        },
      };
    } catch (error: any) {
      // Re-throw known exceptions as-is
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      // Handle any unexpected errors
      throw new UnauthorizedException('Login failed. Please try again.');
    }
  }

  async register(registerDto: RegisterDto, currentUser: any) {
    try {
      // Only admin can register new users (staff) in their organization
      if (!currentUser || currentUser.role !== 'ADMIN') {
        throw new UnauthorizedException('Only admins can register new users');
      }

      // Validate organization ID
      if (!currentUser.organizationId) {
        throw new UnauthorizedException('Admin user must belong to an organization');
      }

      // Normalize email
      const normalizedEmail = registerDto.email.trim().toLowerCase();

      // Check if user already exists in this organization
      const existingUser = await this.prisma.user.findFirst({
        where: { 
          email: normalizedEmail,
          organizationId: currentUser.organizationId,
        },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists in your organization');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Create new user (staff) in the same organization
      const user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: registerDto.name.trim(),
          role: registerDto.role || 'STAFF',
          organizationId: currentUser.organizationId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organizationId: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error: any) {
      // Re-throw known exceptions
      if (error instanceof ConflictException || error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      // Handle any unexpected errors
      throw new BadRequestException('Failed to register staff member. Please try again.');
    }
  }

  async registerNewOrganization(registerDto: RegisterDto) {
    try {
      // Validate input - organizationName is required for new organization registration
      if (!registerDto.email || !registerDto.password || !registerDto.name) {
        throw new BadRequestException('Email, password, and name are required');
      }

      if (!registerDto.organizationName || !registerDto.organizationName.trim()) {
        throw new BadRequestException('Organization name is required');
      }

      // Normalize inputs
      const normalizedEmail = registerDto.email.trim().toLowerCase();
      const organizationName = registerDto.organizationName.trim();

      // Check if organization with this name already exists (case-insensitive)
      const allOrganizations = await this.prisma.organization.findMany();
      const existingOrganization = allOrganizations.find(
        org => org.name.toLowerCase() === organizationName.toLowerCase()
      );

      if (existingOrganization) {
        throw new ConflictException('Organization with this name already exists. Please choose a different name.');
      }

      // Check if user with this email already exists in any organization
      // Since we're creating a new organization, we check if email exists globally
      // This prevents duplicate emails across organizations for security
      const existingUser = await this.prisma.user.findFirst({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists. Please use a different email.');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Create organization first
      const organization = await this.prisma.organization.create({
        data: {
          name: organizationName,
        },
      });

      // Create admin user
      const user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: registerDto.name.trim(),
          role: 'ADMIN',
          organizationId: organization.id,
        },
        include: {
          organization: true,
        },
      });

      // Generate JWT token
      const payload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role, 
        organizationId: user.organizationId 
      };

      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          organizationName: user.organization.name,
          organization: {
            id: user.organization.id,
            name: user.organization.name,
          },
        },
      };
    } catch (error: any) {
      // Re-throw known exceptions
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      // Handle any unexpected errors
      throw new BadRequestException(error.message || 'Registration failed. Please try again.');
    }
  }

  async validateOAuthLogin(profile: any) {
    const { email, name, provider } = profile;

    if (!email) {
      throw new UnauthorizedException('Email not provided by OAuth provider');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists in any organization
    let user = await this.prisma.user.findFirst({
      where: { email: normalizedEmail },
      include: {
        organization: true,
      },
    });

    // If user doesn't exist, create new organization and user
    if (!user) {
      // Generate unique organization name
      const organizationName = `${name}'s Organization ${Date.now()}`;
      const organization = await this.prisma.organization.create({
        data: {
          name: organizationName,
        },
      });

      // Generate a random password (user won't need it for OAuth login)
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);

      user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          password: randomPassword,
          name: name,
          role: 'ADMIN',
          organizationId: organization.id,
        },
        include: {
          organization: true,
        },
      });
    }

    const payload = { email: user.email, sub: user.id, role: user.role, organizationId: user.organizationId };

    // Create audit log for OAuth login
    await this.auditLogService.createLog({
      userId: user.id,
      organizationId: user.organizationId,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      description: `User "${user.name}" logged in via OAuth (${provider})`,
    }).catch(() => {});

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organization?.name || '',
        organization: user.organization ? {
          id: user.organization.id,
          name: user.organization.name,
        } : null,
      },
    };
  }
}
